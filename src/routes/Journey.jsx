import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useContentStore } from "../content/useContentStore";
import "./journey.css";

const chapters = [
  { key: "identity", title: "Identity", portal: "/archive?type=profile" },
  { key: "automation", title: "Automation & Data Pipelines", portal: "/archive?domain=data-engineering" },
  { key: "mlcv", title: "ML & Computer Vision", portal: "/archive?domain=computer-vision" },
  { key: "mlops", title: "MLOps & Observability", portal: "/archive?domain=devops" },
  { key: "embedded", title: "Embedded / Hardware", portal: "/archive?domain=embedded" },
  { key: "research", title: "Research (Perovskite Solar Cells)", portal: "/archive?domain=research" },
  { key: "timeline", title: "Timeline", portal: "/archive" },
  { key: "contact", title: "Contact", portal: "/archive?type=profile" }
];

export default function Journey() {
  const { status, error, allItems } = useContentStore();

  const featured = useMemo(
    () => allItems.filter((i) => i.importance === "featured"),
    [allItems]
  );

  if (status === "loading") {return <div className="journeyShell">Loading…</div>;}
  if (status === "error") {return <div className="journeyShell">Error: {String(error)}</div>;}

  return (
    <main className="journeyShell">
      <header className="journeyHero">
        <h1>The Journey</h1>
        <p>Curated chapters. Cinematic motion. Portals to the full archive.</p>
      </header>

      {chapters.map((c) => (
        <section key={c.key} className="chapter">
          <div className="chapterInner">
            <h2>{c.title}</h2>

            {/* Featured cards only (no duplication; just a spotlight) */}
            <div className="featuredRow">
              {featured.slice(0, 3).map((it) => (
                <div className="spotlight" key={it.id}>
                  <div className="spotTitle">{it.title}</div>
                  <div className="spotSummary">{it.summary}</div>
                </div>
              ))}
            </div>

            <Link className="portal" to={c.portal}>
              View more in Archive →
            </Link>
          </div>
        </section>
      ))}
    </main>
  );
}
