import type { ContentItem } from "@/lib/content/schema";
import ScrollReveal from "./ScrollReveal";
import Parallax from "./Parallax";

function Card({ item }: { item: ContentItem }) {
  const date = item.date?.start ? item.date.start : "";
  return (
    <article className="rounded-2xl border bg-white p-4 md:p-5 hover:bg-black/[0.02] transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold tracking-tight">
            {item.title}
          </h3>
          <p className="mt-2 text-sm opacity-75 leading-relaxed">{item.summary}</p>
        </div>

        {date && <div className="text-xs font-mono opacity-60">{date}</div>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.domains?.slice(0, 6).map((d) => (
          <span key={d} className="rounded-full border px-2.5 py-1 text-xs">
            {d}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Chapter({
  id,
  title,
  subtitle,
  items,
  footer,
  scene,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: ContentItem[];
  footer?: React.ReactNode;
  scene?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <ScrollReveal>
        <div className="rounded-3xl border bg-white p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-wider opacity-60">Chapter</p>

              <Parallax>
                <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                  {title}
                </h2>
              </Parallax>

              <p className="mt-3 text-sm md:text-base opacity-75 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {footer && <div className="md:text-right">{footer}</div>}
          </div>

          {/* Scene hook (optional) */}
          {scene && (
            <div className="mt-6">
              <Parallax strength={0.08} maxOffset={18}>
                {scene}
              </Parallax>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((it) => (
                <ScrollReveal key={it.id} translateY={14}>
                  <Card item={it} />
                </ScrollReveal>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <div className="mt-6 rounded-2xl border p-4">
              <p className="text-sm opacity-70">
                This chapter is a landing section (no featured items shown here).
              </p>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
