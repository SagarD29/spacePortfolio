import { loadAllContent } from "@/lib/content/load";

function main() {
  const all = loadAllContent();
  const counts = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]));

  // Basic duplicate id detection across all collections
  const allItems = Object.values(all).flat();
  const ids = allItems.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);

  if (dupes.length) {
    console.error("Duplicate IDs found:", Array.from(new Set(dupes)));
    process.exit(1);
  }

  console.log("✅ Content valid. Counts:", counts);
}

main();
