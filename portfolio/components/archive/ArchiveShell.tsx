import { loadAllContent } from "@/lib/content/load";
import { matchesQuery, sortDefault, type ArchiveQuery } from "@/lib/content/query";
import Filters from "./Filters";
import SearchK from "./SearchK";
import ItemCard from "./ItemCard";

export default function ArchiveShell({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const data = loadAllContent();

  const q: ArchiveQuery = {
    q: typeof searchParams?.q === "string" ? searchParams.q : undefined,
    type: typeof searchParams?.type === "string" ? searchParams.type : undefined,
    domain: typeof searchParams?.domain === "string" ? searchParams.domain : undefined,
    importance:
      typeof searchParams?.importance === "string" ? searchParams.importance : undefined,
  };

  const allItems = [
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

  const filtered = sortDefault(allItems.filter((it) => matchesQuery(it, q)));

  const activeChips = [
    q.q ? { k: "q", v: q.q } : null,
    q.type ? { k: "type", v: q.type } : null,
    q.domain ? { k: "domain", v: q.domain } : null,
    q.importance ? { k: "importance", v: q.importance } : null,
  ].filter(Boolean) as Array<{ k: string; v: string }>;

  return (
    <main className="min-h-dvh w-full bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs tracking-wider uppercase opacity-60">The Archive</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
                Everything, searchable.
              </h1>
              <p className="mt-2 text-sm opacity-70 max-w-2xl">
                This is the complete inventory. Use filters and search to find anything fast.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SearchK />
              <a
                href="/"
                className="hidden sm:inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-black/5 transition"
              >
                Home
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <Filters />
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs opacity-60">Active:</span>
              {activeChips.map((c) => (
                <span
                  key={`${c.k}:${c.v}`}
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs"
                >
                  <span className="font-mono opacity-70">{c.k}</span>
                  <span className="opacity-90">{c.v}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm opacity-70">
            Showing{" "}
            <span className="font-semibold text-black opacity-100">{filtered.length}</span>{" "}
            items
          </p>

          <div className="text-xs opacity-60">
            Tip: use <span className="font-mono">/archive?domain=ml</span> or{" "}
            <span className="font-mono">Cmd/Ctrl+K</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border p-6">
            <h2 className="text-sm font-semibold">No results</h2>
            <p className="mt-2 text-sm opacity-70">
              Try clearing filters, removing keywords, or searching with fewer terms.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs opacity-60 flex flex-wrap items-center justify-between gap-3">
          <span>Single source of truth: content/*.json</span>
          <a className="underline hover:opacity-100" href="/journey">
            Go to Journey →
          </a>
        </div>
      </footer>
    </main>
  );
}
