import qs from "qs";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContentStore } from "../content/useContentStore";
import "./archive.css";

function parseQuery(search) {
  return qs.parse(search, { ignoreQueryPrefix: true });
}

function asArray(v) {
  if (!v) {return [];}
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

function clampCount(n, max) {
  return Math.max(0, Math.min(Number(n) || 0, max));
}

function pickIntroFromProfile(profileItem) {
  const s = profileItem?.summary || "";
  // Use everything before "WEBSITE SUMMARY" if present (your profile.json contains both)
  const idx = s.indexOf("\n\nWEBSITE SUMMARY");
  const trimmed = (idx >= 0 ? s.slice(0, idx) : s).trim();
  // Keep intro readable: first ~4 lines max
  const lines = trimmed.split("\n").map((x) => x.trim()).filter(Boolean);
  return lines.slice(0, 4).join("\n");
}

function matchesFilters(item, q) {
  if (!item) {return false;}

  if (q.type && item.type !== q.type) {return false;}
  if (q.importance && item.importance !== q.importance) {return false;}

  if (q.domain) {
    const domain = Array.isArray(q.domain) ? q.domain : [q.domain];
    if (!domain.every((d) => (item.domains || []).includes(d))) {return false;}
  }

  if (q.tag) {
    const tag = Array.isArray(q.tag) ? q.tag : [q.tag];
    if (!tag.every((t) => (item.tags || []).includes(t))) {return false;}
  }

  if (q.query) {
    const s = String(q.query).toLowerCase();
    const hay = `${item.title || ""} ${item.summary || ""} ${(item.tags || []).join(" ")} ${(item.domains || []).join(" ")}`.toLowerCase();
    if (!hay.includes(s)) {return false;}
  }

  return true;
}

function fmtRange(date) {
  const a = date?.start || "";
  const b = date?.end || "";
  if (a && b) {return `${a} → ${b}`;}
  return a || "—";
}

function bestLink(item) {
  // Try to find a primary URL-like link
  const links = item?.links || {};
  return (
    links.url ||
    links.website ||
    links.portfolio ||
    links.github ||
    links.linkedin ||
    links.repo ||
    ""
  );
}

export default function Archive() {
  const { status, error, allItems } = useContentStore();
  const loc = useLocation();
  const nav = useNavigate();

  const qRaw = useMemo(() => parseQuery(loc.search), [loc.search]);

  const q = useMemo(() => {
    return {
      query: qRaw.query || "",
      type: qRaw.type || "",
      importance: qRaw.importance || "",
      domain: asArray(qRaw.domain),
      tag: asArray(qRaw.tag),
    };
  }, [qRaw]);

  const [localSearch, setLocalSearch] = useState(q.query);

  function updateQuery(next) {
    const merged = { ...q, ...next };

    const clean = {
      ...(merged.query ? { query: merged.query } : {}),
      ...(merged.type ? { type: merged.type } : {}),
      ...(merged.importance ? { importance: merged.importance } : {}),
      ...(merged.domain?.length ? { domain: merged.domain } : {}),
      ...(merged.tag?.length ? { tag: merged.tag } : {}),
    };

    const search = qs.stringify(clean, { addQueryPrefix: true, arrayFormat: "repeat" });
    nav({ pathname: loc.pathname, search });
  }

  function toggleMulti(key, value) {
    const cur = new Set(q[key] || []);
    if (cur.has(value)) {cur.delete(value);}
    else {cur.add(value);}
    updateQuery({ [key]: Array.from(cur) });
  }

  function clearAll() {
    setLocalSearch("");
    updateQuery({ query: "", type: "", importance: "", domain: [], tag: [] });
  }

  function applySearch() {
    updateQuery({ query: localSearch.trim() });
  }

  const facets = useMemo(() => {
    const types = uniqSorted(allItems.map((i) => i?.type));
    const importance = uniqSorted(allItems.map((i) => i?.importance));
    const domains = uniqSorted(allItems.flatMap((i) => i?.domains || []));
    const tags = uniqSorted(allItems.flatMap((i) => i?.tags || []));
    return { types, importance, domains, tags };
  }, [allItems]);

  const filtered = useMemo(() => {
    const merged = { ...q };
    // If the user typed but didn’t apply, still filter live locally for instant feedback:
    if (localSearch.trim()) {merged.query = localSearch.trim();}

    return allItems
      .filter((it) => matchesFilters(it, merged))
      .sort((a, b) => String(b?.date?.start || "").localeCompare(String(a?.date?.start || "")));
  }, [allItems, q, localSearch]);

  const profile = useMemo(() => allItems.find((x) => x?.type === "profile"), [allItems]);
  const linksItem = useMemo(() => allItems.find((x) => x?.type === "links"), [allItems]);

  const intro = useMemo(() => pickIntroFromProfile(profile), [profile]);

  const featuredProjects = useMemo(() => {
    return allItems
      .filter((x) => x?.type === "project" && x?.importance === "featured")
      .sort((a, b) => String(b?.date?.start || "").localeCompare(String(a?.date?.start || "")))
      .slice(0, 2);
  }, [allItems]);

  const recentActivities = useMemo(() => {
    return allItems
      .filter((x) => x?.type === "activity" || x?.type === "activities")
      .sort((a, b) => String(b?.date?.start || "").localeCompare(String(a?.date?.start || "")))
      .slice(0, 1);
  }, [allItems]);

  const keyLinks = useMemo(() => {
    // Prefer profile links, fallback to links.json
    const l = profile?.links && Object.keys(profile.links).length ? profile.links : (linksItem?.links || {});
    return {
      github: l.github || "",
      linkedin: l.linkedin || "",
      portfolio: l.port || l.portfolio || l.website || "",
    };
  }, [profile, linksItem]);

  if (status === "loading") {return <div className="cvArchiveShell">Loading…</div>;}
  if (status === "error") {return <div className="cvArchiveShell">Error: {String(error)}</div>;}

  return (
    <main className="cvArchiveShell">
      {/* INTRO / SUMMARY */}
      <section className="introPanel">
        <div className="introLeft">
          <h1>{profile?.title || "Sagar Desai"}</h1>
          <div className="introSubtitle">Professional Summary + searchable CV archive</div>

          <p className="introText">{intro || "Add a short professional summary in public/content/profile.json → summary."}</p>

          <div className="introPills">
            {(profile?.tags || []).slice(0, 6).map((t) => (
              <span key={t} className="pill">{t}</span>
            ))}
            {(profile?.domains || []).slice(0, 4).map((d) => (
              <span key={d} className="pill subtle">{d}</span>
            ))}
          </div>

          <div className="introPrimaryLinks">
            {keyLinks.github && (
              <a className="primaryLink" href={keyLinks.github} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {keyLinks.linkedin && (
              <a className="primaryLink" href={keyLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {keyLinks.portfolio && (
              <a className="primaryLink" href={keyLinks.portfolio} target="_blank" rel="noreferrer">Portfolio</a>
            )}
          </div>
        </div>

        <div className="introRight">
          <div className="miniCard">
            <div className="miniCardTitle">Quick Stats</div>
            <div className="miniStats">
              <div className="stat">
                <div className="statNum">{allItems.length}</div>
                <div className="statLabel">total entries</div>
              </div>
              <div className="stat">
                <div className="statNum">{facets.types.length}</div>
                <div className="statLabel">types</div>
              </div>
              <div className="stat">
                <div className="statNum">{facets.domains.length}</div>
                <div className="statLabel">domains</div>
              </div>
            </div>
            <div className="miniHint">
              Use the advanced search below to filter skills, experience, projects, education, certifications and more.
            </div>
          </div>
        </div>
      </section>

      {/* USEFUL LINKS ROW */}
      <section className="usefulRow">
        <div className="usefulGrid">
          <a className="usefulCard" href={keyLinks.github || "#"} target="_blank" rel="noreferrer">
            <div className="usefulTitle">GitHub</div>
            <div className="usefulDesc">Repositories, code, automation projects.</div>
            <div className="usefulMeta">Open</div>
          </a>

          <a className="usefulCard" href={keyLinks.linkedin || "#"} target="_blank" rel="noreferrer">
            <div className="usefulTitle">LinkedIn</div>
            <div className="usefulDesc">Professional timeline + roles.</div>
            <div className="usefulMeta">Open</div>
          </a>

          <a className="usefulCard" href={keyLinks.portfolio || "#"} target="_blank" rel="noreferrer">
            <div className="usefulTitle">Portfolio</div>
            <div className="usefulDesc">Interactive journey + archive.</div>
            <div className="usefulMeta">Open</div>
          </a>

          {featuredProjects[0] ? (
            <button
              className="usefulCard"
              type="button"
              onClick={() => updateQuery({ type: "project", importance: "featured", query: featuredProjects[0].title })}
            >
              <div className="usefulTitle">Key Project</div>
              <div className="usefulDesc">{featuredProjects[0].title}</div>
              <div className="usefulMeta">Filter</div>
            </button>
          ) : (
            <div className="usefulCard muted">
              <div className="usefulTitle">Key Project</div>
              <div className="usefulDesc">No featured project found.</div>
              <div className="usefulMeta">—</div>
            </div>
          )}

          {recentActivities[0] ? (
            <button
              className="usefulCard"
              type="button"
              onClick={() => updateQuery({ query: recentActivities[0].title })}
            >
              <div className="usefulTitle">Recent Activity</div>
              <div className="usefulDesc">{recentActivities[0].title}</div>
              <div className="usefulMeta">Filter</div>
            </button>
          ) : (
            <div className="usefulCard muted">
              <div className="usefulTitle">Recent Activity</div>
              <div className="usefulDesc">No activity entry found.</div>
              <div className="usefulMeta">—</div>
            </div>
          )}
        </div>
      </section>

      {/* ADVANCED SEARCH */}
      <section className="searchPanel">
        <div className="searchTop">
          <div className="searchTitle">Advanced Search</div>

          <div className="searchActions">
            <button className={`tagBtn ${(!q.query && !q.type && !q.importance && !q.domain.length && !q.tag.length) ? "active" : ""}`} type="button" onClick={clearAll}>
              Show all
            </button>

            <div className="resultsCount">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>

            <button className="ghostBtn" type="button" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <div className="searchBarRow">
          <input
            className="archiveSearch"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") {applySearch();} }}
            placeholder="Search skills, experience, projects, education…"
            aria-label="Search archive"
          />
          <button className="primaryBtn" type="button" onClick={applySearch}>Search</button>
        </div>

        <div className="advancedGrid">
          <div className="filterBlock">
            <label className="filterLabel" htmlFor="typeSel">Type</label>
            <select
              id="typeSel"
              className="filterSelect"
              value={q.type}
              onChange={(e) => updateQuery({ type: e.target.value })}
            >
              <option value="">All</option>
              {facets.types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filterBlock">
            <label className="filterLabel" htmlFor="impSel">Importance</label>
            <select
              id="impSel"
              className="filterSelect"
              value={q.importance}
              onChange={(e) => updateQuery({ importance: e.target.value })}
            >
              <option value="">All</option>
              {facets.importance.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filterBlock wide">
            <div className="filterLabelRow">
              <span className="filterLabel">Domains</span>
              <span className="helper">multi-select</span>
            </div>
            <div className="chips">
              {facets.domains.slice(0, 18).map((d) => {
                const active = q.domain.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    className={`chip ${active ? "active" : ""}`}
                    onClick={() => toggleMulti("domain", d)}
                    title={d}
                  >
                    {d}
                  </button>
                );
              })}
              {facets.domains.length > 18 && (
                <span className="overflowHint">+{clampCount(facets.domains.length - 18, 999)} more</span>
              )}
            </div>
          </div>

          <div className="filterBlock wide">
            <div className="filterLabelRow">
              <span className="filterLabel">Tags</span>
              <span className="helper">multi-select</span>
            </div>
            <div className="chips">
              {facets.tags.slice(0, 18).map((t) => {
                const active = q.tag.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${active ? "active" : ""}`}
                    onClick={() => toggleMulti("tag", t)}
                    title={t}
                  >
                    {t}
                  </button>
                );
              })}
              {facets.tags.length > 18 && (
                <span className="overflowHint">+{clampCount(facets.tags.length - 18, 999)} more</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="resultsPanel">
        <div className="resultsHeader">
          <div className="resultsTitle">Results</div>
          <div className="resultsSub">
            Showing entries matching your query/filters. Click links inside cards to open sources.
          </div>
        </div>

        <div className="archiveGrid">
          {filtered.map((item) => {
            const url = bestLink(item);
            return (
              <article key={item.id} className={`card ${item.importance || "standard"}`}>
                <div className="cardTop">
                  <div className="cardTitleWrap">
                    <h2 title={item.title}>{item.title}</h2>
                    <div className="metaRow">
                      <span className="meta">{item.type}</span>
                      <span className="dot">•</span>
                      <span className="meta">{fmtRange(item.date)}</span>
                      {item.importance ? (
                        <>
                          <span className="dot">•</span>
                          <span className={`impBadge ${item.importance}`}>{item.importance}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {url ? (
                    <a className="openBtn" href={url} target="_blank" rel="noreferrer">Open</a>
                  ) : (
                    <span className="openBtn disabled">Open</span>
                  )}
                </div>

                <p className="summary">{item.summary}</p>

                {!!(item.domains || []).length && (
                  <div className="pillRow">
                    {(item.domains || []).slice(0, 6).map((d) => (
                      <button
                        className="pill"
                        type="button"
                        key={d}
                        onClick={() => updateQuery({ domain: [d] })}
                        title={`Filter by domain: ${d}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}

                {!!(item.tags || []).length && (
                  <div className="tagRow">
                    {(item.tags || []).slice(0, 10).map((t) => (
                      <button
                        className="tag"
                        type="button"
                        key={t}
                        onClick={() => updateQuery({ tag: [t] })}
                        title={`Filter by tag: ${t}`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}

                <div className="linksRow">
                  {item.links &&
                    Object.entries(item.links)
                      .filter(([, v]) => !!v)
                      .slice(0, 4)
                      .map(([k, v]) => (
                        <a key={k} href={v} target="_blank" rel="noreferrer">
                          {k}
                        </a>
                      ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
