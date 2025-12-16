import { loadAllContent } from "@/lib/content/load";
import type { ContentItem } from "@/lib/content/schema";
import Chapter from "./Chapter";
import PortalLink from "./PortalLink";
import ScrollReveal from "./ScrollReveal";
import SceneHook from "./SceneHook";

type JourneyChapter = {
  key:
    | "identity"
    | "automation"
    | "mlcv"
    | "mlops"
    | "embedded"
    | "research"
    | "timeline"
    | "contact";
  title: string;
  subtitle: string;
  pick: (items: ContentItem[]) => ContentItem[];
  portals: Array<{ label: string; href: string }>;
  sceneLabel?: string;
};

function isFeatured(x: ContentItem) {
  return x.importance === "featured";
}

function byDateDesc(a: ContentItem, b: ContentItem) {
  return (b.date?.start || "").localeCompare(a.date?.start || "");
}

function topN(items: ContentItem[], n: number) {
  return [...items].sort(byDateDesc).slice(0, n);
}

export default function JourneyShell() {
  const data = loadAllContent();

  const allItems: ContentItem[] = [
    data.profile,
    ...data.projects,
    ...data.experience,
    ...data.education,
    ...data.skills,
    ...data.certifications,
    ...data.plans,
    ...data.activities,
    ...data.volunteering,
  ];

  const featured = allItems.filter(isFeatured);

  const chapters: JourneyChapter[] = [
    {
      key: "identity",
      title: "Identity",
      subtitle: "Engineer first. Automation-minded. Built for real-world systems.",
      pick: () => [data.profile],
      portals: [
        { label: "View full experience", href: "/archive?type=exp" },
        { label: "View full skills", href: "/archive?type=skill" },
      ],
      sceneLabel: "identity / about",
    },
    {
      key: "automation",
      title: "Automation & Data Pipelines",
      subtitle: "Make the boring parts disappear — reliably.",
      pick: (items) =>
        topN(
          items.filter(
            (x) =>
              isFeatured(x) &&
              (x.domains.includes("data-engineering") || x.domains.includes("devops"))
          ),
          6
        ),
      portals: [
        { label: "All data engineering", href: "/archive?domain=data-engineering" },
        { label: "All automation projects", href: "/archive?type=project&domain=data-engineering" },
      ],
      sceneLabel: "pipelines / orchestration",
    },
    {
      key: "mlcv",
      title: "ML & Computer Vision",
      subtitle: "From datasets → inference → deployment constraints.",
      pick: (items) =>
        topN(
          items.filter(
            (x) =>
              isFeatured(x) &&
              (x.domains.includes("ml") || x.domains.includes("computer-vision"))
          ),
          6
        ),
      portals: [
        { label: "All ML", href: "/archive?domain=ml" },
        { label: "All computer vision", href: "/archive?domain=computer-vision" },
      ],
      sceneLabel: "vision / inference",
    },
    {
      key: "mlops",
      title: "MLOps & Observability",
      subtitle: "If you can’t measure it, you can’t trust it.",
      pick: (items) => topN(items.filter((x) => isFeatured(x) && x.domains.includes("devops")), 6),
      portals: [
        { label: "All DevOps", href: "/archive?domain=devops" },
        { label: "All monitoring work", href: "/archive?q=grafana" },
      ],
      sceneLabel: "observability / reliability",
    },
    {
      key: "embedded",
      title: "Embedded & Hardware",
      subtitle: "Hands-on engineering: circuits, sensors, systems.",
      pick: (items) => topN(items.filter((x) => isFeatured(x) && x.domains.includes("embedded")), 6),
      portals: [
        { label: "All embedded", href: "/archive?domain=embedded" },
        { label: "All IoT", href: "/archive?domain=iot" },
      ],
      sceneLabel: "hardware / systems",
    },
    {
      key: "research",
      title: "Research",
      subtitle: "Transparent perovskite solar cells and scalable PV thinking.",
      pick: (items) => topN(items.filter((x) => isFeatured(x) && x.domains.includes("research")), 6),
      portals: [
        { label: "All research", href: "/archive?domain=research" },
        { label: "All projects", href: "/archive?type=project" },
      ],
      sceneLabel: "materials / energy",
    },
    {
      key: "timeline",
      title: "High-level timeline",
      subtitle: "A quick sweep of the featured milestones.",
      pick: (items) => topN(items.filter(isFeatured), 10),
      portals: [
        { label: "Open full Archive", href: "/archive" },
        { label: "Featured only", href: "/archive?importance=featured" },
      ],
      sceneLabel: "timeline / milestones",
    },
    {
      key: "contact",
      title: "Contact",
      subtitle: "Let’s talk — roles, projects, or collaboration.",
      pick: () => [],
      portals: [
        { label: "LinkedIn", href: data.profile.links?.linkedin || "/archive?type=profile" },
        { label: "GitHub", href: data.profile.links?.github || "/archive?type=profile" },
        { label: "Portfolio", href: data.profile.links?.portfolio || "/" },
      ],
      sceneLabel: "contact",
    },
  ];

  return (
    <main className="bg-white text-black">
      <div className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm underline opacity-70 hover:opacity-100">
              Home
            </a>
            <span className="text-xs opacity-40">/</span>
            <span className="text-sm font-semibold">Journey</span>
          </div>

          <a
            href="/archive"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
          >
            Open Archive →
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-wider opacity-60">The Journey</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">
            Building systems that scale — in code, data, and hardware.
          </h1>
          <p className="mt-4 text-base md:text-lg opacity-75 max-w-3xl leading-relaxed">
            Curated scrollytelling: featured work only. The Archive remains the complete inventory.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/archive?importance=featured"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5 transition"
            >
              View featured in Archive
            </a>
            <a
              href="/archive"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5 transition"
            >
              View everything
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* Chapters */}
      <div className="mx-auto max-w-6xl px-4 pb-16 space-y-10">
        {chapters.map((ch) => (
          <Chapter
            key={ch.key}
            id={ch.key}
            title={ch.title}
            subtitle={ch.subtitle}
            items={ch.pick(featured)}
            scene={<SceneHook label={ch.sceneLabel} />}
            footer={
              <div className="flex flex-wrap gap-2">
                {ch.portals.map((p) => (
                  <PortalLink key={p.href} href={p.href} label={p.label} />
                ))}
              </div>
            }
          />
        ))}
      </div>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs opacity-60 flex flex-wrap items-center justify-between gap-3">
          <span>Journey shows featured items only. Archive is authoritative.</span>
          <a className="underline hover:opacity-100" href="/archive">
            Go to Archive →
          </a>
        </div>
      </footer>
    </main>
  );
}
