import { useEffect, useMemo, useState } from "react";

const FILES = [
  "profile",
  "links",
  "projects",
  "experience",
  "education",
  "skills",
  "certifications",
  "plans",
  "activities",
  "volunteering",
];

async function fetchJson(name) {
  const res = await fetch(`/content/${name}.json`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load /content/${name}.json`);
  }
  return res.json();
}

export function useContentStore() {
  const [data, setData] = useState({ status: "loading", error: null, raw: {} });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const entries = await Promise.all(
          FILES.map(async (f) => [f, await fetchJson(f)])
        );
        const raw = Object.fromEntries(entries);

        if (!alive) {
          return;
        }
        setData({ status: "ready", error: null, raw });
      } catch (e) {
        if (!alive) {
          return;
        }
        setData({ status: "error", error: e, raw: {} });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const allItems = useMemo(() => {
    if (data.status !== "ready") {
      return [];
    }

    const out = [];
    for (const value of Object.values(data.raw)) {
      if (Array.isArray(value)) {
        out.push(...value);
      } else if (value && typeof value === "object") {
        out.push(value);
      }
    }
    return out;
  }, [data]);

  return { ...data, allItems };
}
