import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./homeGateway.css";

export default function HomeGateway() {
  const nav = useNavigate();
  const locked = useRef(false);

  useEffect(() => {
    const onWheel = (e) => {
      if (locked.current) {return;}

      // scroll down chooses right panel, scroll up chooses left (tweak as you like)
      locked.current = true;
      if (e.deltaY > 0) {nav("/archive");}
      else {nav("/journey");}

      setTimeout(() => (locked.current = false), 800);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [nav]);

  return (
    <main className="gateway">
      <section className="panel left" onClick={() => nav("/journey")}>
        <div className="panelInner">
          <h1>The Journey</h1>
          <p>Curated, cinematic scrollytelling.</p>
          <span className="cta">Enter →</span>
        </div>
      </section>

      <section className="panel right" onClick={() => nav("/archive")}>
        <div className="panelInner">
          <h1>The Archive</h1>
          <p>Everything. Searchable. Recruiter-friendly.</p>
          <span className="cta">Browse →</span>
        </div>
      </section>
    </main>
  );
}
