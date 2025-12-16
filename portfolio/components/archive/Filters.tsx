"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TYPES = ["", "project", "exp", "edu", "skill", "cert", "plan", "activity", "volunteer"] as const;

const DOMAINS = [
  "",
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

const IMPORTANCE = ["", "featured", "standard", "mini"] as const;

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
    <div className="rounded-2xl border bg-white p-3 md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Search */}
        <div className="md:col-span-6">
          <label className="block text-xs opacity-60 mb-1">Search</label>
          <input
            value={currentQ}
            onChange={(e) => apply({ q: e.target.value })}
            placeholder="Search title, summary, tags…"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            aria-label="Search archive"
          />
        </div>

        {/* Type */}
        <div className="md:col-span-2">
          <label className="block text-xs opacity-60 mb-1">Type</label>
          <select
            value={currentType}
            onChange={(e) => apply({ type: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black/10"
            aria-label="Filter by type"
          >
            {TYPES.map((t) => (
              <option key={t || "all"} value={t}>
                {t ? t : "All"}
              </option>
            ))}
          </select>
        </div>

        {/* Domain */}
        <div className="md:col-span-3">
          <label className="block text-xs opacity-60 mb-1">Domain</label>
          <select
            value={currentDomain}
            onChange={(e) => apply({ domain: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black/10"
            aria-label="Filter by domain"
          >
            {DOMAINS.map((d) => (
              <option key={d || "all"} value={d}>
                {d ? d : "All"}
              </option>
            ))}
          </select>
        </div>

        {/* Importance + Clear */}
        <div className="md:col-span-1 flex md:flex-col gap-3">
          <div className="flex-1">
            <label className="block text-xs opacity-60 mb-1">Rank</label>
            <select
              value={currentImportance}
              onChange={(e) => apply({ importance: e.target.value })}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Filter by importance"
            >
              {IMPORTANCE.map((x) => (
                <option key={x || "all"} value={x}>
                  {x ? x : "All"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearAll}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs opacity-60">
        Journey “portals” will link here using query filters only (e.g.{" "}
        <span className="font-mono">/archive?domain=data-engineering</span>).
      </p>
    </div>
  );
}
