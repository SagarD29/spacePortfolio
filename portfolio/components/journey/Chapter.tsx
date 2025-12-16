import type { ContentItem } from "@/lib/content/schema";
import ScrollReveal from "./ScrollReveal";
import SceneHook from "./SceneHook";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function Card({ item }: { item: ContentItem }) {
  const date = item.date?.start ? item.date.start : "";
  return (
    <article className="rounded-3xl border border-white/12 bg-white/6 p-4 md:p-5 hover:bg-white/10 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold tracking-tight text-white/95">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.summary}</p>
        </div>

        {date && <div className="text-xs font-mono text-white/55">{date}</div>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.domains?.slice(0, 6).map((d) => (
          <Pill key={d}>{d}</Pill>
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
  sceneLabel,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: ContentItem[];
  footer?: React.ReactNode;
  sceneLabel?: string;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-[32px] border border-white/12">
          {/* FULL-CHAPTER BACKGROUND SCENE */}
          <div className="absolute inset-0">
            <SceneHook label={sceneLabel} mode="background" />
            {/* darken for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/70" />
          </div>

          {/* FOREGROUND CONTENT */}
          <div className="relative p-5 md:p-7">
            <div className="rounded-[28px] border border-white/12 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-wider text-white/55">Chapter</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                    {subtitle}
                  </p>
                </div>

                {footer && <div className="md:text-right">{footer}</div>}
              </div>

              <div className="mt-6">
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((it) => (
                      <ScrollReveal key={it.id} translateY={12}>
                        <Card item={it} />
                      </ScrollReveal>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
                    <p className="text-sm text-white/70">
                      This chapter is a landing section (no featured items shown here).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
