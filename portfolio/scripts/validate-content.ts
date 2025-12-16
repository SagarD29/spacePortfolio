import { loadAllContent } from "../lib/content/load";
import { validateDates, validateIdFormat } from "../lib/content/normalize";

function main() {
  const all = loadAllContent();
  const counts = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]));

  const allItems = Object.values(all).flat();

  // Duplicate IDs
  const ids = allItems.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) {
    console.error("Duplicate IDs found:", Array.from(new Set(dupes)));
    process.exit(1);
  }

  // Format checks
  for (const item of allItems) {
    validateIdFormat(item);
    validateDates(item);
  }

  console.log("✅ Content valid. Counts:", counts);
}

main();
