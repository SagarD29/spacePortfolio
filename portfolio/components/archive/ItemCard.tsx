import type { ContentItem } from "@/lib/content/schema";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">
      {children}
    </span>
  );
}

function formatDate(start?: string, end?: string) {
  const s = start?.trim() || "";
  const e = end?.trim() || "";
  if (s && e) return `${s} → ${e}`;
  return s || e || "";
}

export default function ItemCard({ item }: { item: ContentItem }) {
  const dateLabel = formatDate(item.date?.start, item.date?.end);

  return (
    <article className="group rounded-2xl border bg-white p-4 md:p-5 hover:bg-black/[0.02] transition">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base md:text-lg font-semibold tracking-tight truncate">
              {item.title}
            </h2>
            <Pill>
              <span className="font-mono opacity-80">{item.type}</span>
            </Pill>
            <Pill>
              <span className="opacity-70">{item.importance}</span>
            </Pill>
          </div>

          <p className="mt-2 text-sm opacity-80 leading-relaxed">{item.summary}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.domains?.map((d) => (
              <Pill key={d}>
                <span className="opacity-80">{d}</span>
              </Pill>
            ))}
            {item.tags?.slice(0, 8).map((t) => (
              <Pill key={t}>
                <span className="opacity-60">#{t}</span>
              </Pill>
            ))}
          </div>

          <div className="mt-3 text-xs opacity-55 font-mono break-all">
            {item.id}
          </div>
        </div>

        <div className="shrink-0 flex md:flex-col items-start md:items-end gap-2 md:gap-1">
          {dateLabel && (
            <div className="text-xs opacity-65 font-mono">{dateLabel}</div>
          )}
          {item.links && Object.keys(item.links).length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {Object.entries(item.links).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm underline opacity-70 hover:opacity-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-black/5" />
      <div className="mt-3 flex items-center justify-between text-xs opacity-60">
        <span>Hover for focus • Recruiter-friendly</span>
        <span className="font-mono opacity-60 group-hover:opacity-90 transition">
          View via filters in URL
        </span>
      </div>
    </article>
  );
}
