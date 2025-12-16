import type { ContentItem } from "@/lib/content/schema";

export default function ItemCard({ item }: { item: ContentItem }) {
  return (
    <article className="border rounded-2xl p-4 hover:bg-black/5 transition">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
          <p className="text-xs opacity-60 mt-1">
            <span className="font-mono">{item.type}</span> ·{" "}
            <span className="font-mono">{item.id}</span>
          </p>
        </div>

        <div className="text-xs opacity-70 font-mono">
          {item.date?.start || ""}{item.date?.end ? ` → ${item.date.end}` : ""}
        </div>
      </div>

      <p className="text-sm opacity-80 mt-3">{item.summary}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {item.importance && (
          <span className="text-xs border rounded-full px-2 py-1">{item.importance}</span>
        )}
        {item.domains?.map((d) => (
          <span key={d} className="text-xs border rounded-full px-2 py-1">
            {d}
          </span>
        ))}
        {item.tags?.slice(0, 6).map((t) => (
          <span key={t} className="text-xs border rounded-full px-2 py-1 opacity-70">
            #{t}
          </span>
        ))}
      </div>

      {item.links && Object.keys(item.links).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
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
    </article>
  );
}
