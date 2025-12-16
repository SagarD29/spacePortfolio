import type { ContentItem } from "./schema";

export type ArchiveQuery = {
  type?: string;        // e.g. "project" | "experience" etc (you decide values)
  domain?: string;      // must match controlled vocab on items
  q?: string;           // full-text query over title/summary/tags
  importance?: string;  // featured|standard|mini
};

export function matchesQuery(item: ContentItem, query: ArchiveQuery): boolean {
  if (query.type && item.type !== query.type) return false;
  if (query.domain && !item.domains.includes(query.domain as any)) return false;
  if (query.importance && item.importance !== query.importance) return false;

  if (query.q) {
    const hay = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.domains.join(" ")}`.toLowerCase();
    const needle = query.q.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export function sortDefault(items: ContentItem[]) {
  // newest-first if dates sortable, fallback stable
  return [...items].sort((a, b) => (b.date.start || "").localeCompare(a.date.start || ""));
}
