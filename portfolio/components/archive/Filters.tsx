"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TYPES = ["project", "exp", "edu", "skill", "cert", "plan", "activity", "volunteer"] as const;

const DOMAINS = [
  "ml",
  "computer-vision",
  "data-engineering",
  "devops",
  "cloud",
  "frontend",
  "embedded",
  "iot",
  "research",
  "trading",
  "creative",
  "support",
  "retail",
  "leadership",
  "events",
] as const;

const IMPORTANCE = ["featured", "standard", "mini"] as const;

function setParam(params: URLSearchParams, key: string, value?: string) {
  if (!value) params.delete(key);
  else params.set(key, value);
}

export default function Filters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentType = sp.get("type") || "";
  const currentDomain = sp.get("domain") || "";
  const currentImportance = sp.get("importance") || "";
  const currentQ = sp.get("q") || "";

  function apply(next: Partial<{ type: string; domain: string; importance: string; q: string }>) {
    const params = new URLSearchParams(sp.toString());
    if ("type" in next) setParam(params, "type", next.type || undefined);
    if ("domain" in next) setParam(params, "domain", next.domain || undefined);
    if ("importance" in next) setParam(params, "importance", next.importance || undefined);
    if ("q" in next) setParam(params, "q", next.q || undefined);

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={currentQ}
          onChange={(e) => apply({ q: e.target.value })}
          placeholder="Search title / summary / tags…"
          className="w-full md:flex-1 border rounded-xl px-3 py-2 text-sm"
          aria-label="Search archive"
        />

        <select
          value={currentType}
          onChange={(e) => apply({ type: e.target.value })}
          className="border rounded-xl px-3 py-2 text-sm"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={currentDomain}
          onChange={(e) => apply({ domain: e.target.value })}
          className="border rounded-xl px-3 py-2 text-sm"
          aria-label="Filter by domain"
        >
          <option value="">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={currentImportance}
          onChange={(e) => apply({ importance: e.target.value })}
          className="border rounded-xl px-3 py-2 text-sm"
          aria-label="Filter by importance"
        >
          <option value="">All importance</option>
          {IMPORTANCE.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>

        <button
          onClick={clearAll}
          className="border rounded-xl px-3 py-2 text-sm hover:bg-black/5"
        >
          Clear
        </button>
      </div>

      <p className="text-xs opacity-60">
        Tip: Journey “portals” will link here using query filters (e.g. <span className="font-mono">/archive?domain=ml</span>).
      </p>
    </div>
  );
}
