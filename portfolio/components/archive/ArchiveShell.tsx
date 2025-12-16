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
  const allItems = Object.values(data).flat();

  const q: ArchiveQuery = {
    q: typeof searchParams?.q === "string" ? searchParams?.q : undefined,
    type: typeof searchParams?.type === "string" ? searchParams?.type : undefined,
    domain: typeof searchParams?.domain === "string" ? searchParams?.domain : undefined,
    importance: typeof searchParams?.importance === "string" ? searchParams?.importance : undefined,
  };

  const filtered = sortDefault(allItems.filter((it) => matchesQuery(it, q)));

  return (
    <main className="min-h-dvh w-full">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
            <p className="text-sm opacity-70 mt-1">
              Everything. Search + filter. No duplicates — single source of truth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SearchK />
            <a
              href="/"
              className="text-sm underline opacity-70 hover:opacity-100"
              aria-label="Back to Home"
            >
              Home
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-4">
          <Filters />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm opacity-70 mb-4">
          Showing <span className="font-medium opacity-100">{filtered.length}</span> items
        </p>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 border rounded-xl p-6">
            <p className="text-sm opacity-70">No results. Try clearing filters or searching differently.</p>
          </div>
        )}
      </section>
    </main>
  );
}
