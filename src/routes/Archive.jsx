import qs from "qs";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useContentStore } from "../content/useContentStore";
import "./archive.css";

function parseQuery(search) {
  return qs.parse(search, { ignoreQueryPrefix: true });
}

function matchesFilters(item, q) {
  if (!item) {return false;}

  // /archive?type=project&domain=ml&importance=featured&tag=opencv
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

export default function Archive() {
  const { status, error, allItems } = useContentStore();
  const loc = useLocation();
  const q = useMemo(() => parseQuery(loc.search), [loc.search]);

  const [localSearch, setLocalSearch] = useState("");

  const filtered = useMemo(() => {
    const merged = { ...q };
    if (localSearch.trim()) {merged.query = localSearch.trim();}

    return allItems
      .filter((it) => matchesFilters(it, merged))
      .sort((a, b) => String(b?.date?.start || "").localeCompare(String(a?.date?.start || "")));
  }, [allItems, q, localSearch]);

  if (status === "loading") {return <div className="archiveShell">Loading…</div>;}
  if (status === "error") {return <div className="archiveShell">Error: {String(error)}</div>;}

  return (
    <main className="archiveShell">
      <header className="archiveHeader">
        <div>
          <h1>The Archive</h1>
          <p>Everything, searchable and filterable.</p>
        </div>

        <input
          className="archiveSearch"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search (title, summary, tags, domains)…"
        />
      </header>

      <section className="archiveGrid">
        {filtered.map((item) => (
          <article key={item.id} className={`card ${item.importance || "standard"}`}>
            <div className="cardTop">
              <h2>{item.title}</h2>
              <span className="meta">
                {item.type} · {item.date?.start || "—"}
              </span>
            </div>

            <p className="summary">{item.summary}</p>

            <div className="pillRow">
              {(item.domains || []).slice(0, 4).map((d) => (
                <span className="pill" key={d}>{d}</span>
              ))}
            </div>

            <div className="linksRow">
              {item.links &&
                Object.entries(item.links).slice(0, 3).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noreferrer">
                    {k}
                  </a>
                ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
