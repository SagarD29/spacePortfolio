import type { ContentItem } from "./schema";

const ID_RE =
  /^(profile|project|exp|edu|skill|cert|plan|activity|volunteer)__[a-z0-9-]+__\d{4}(-\d{2})?$/;

export function validateIdFormat(item: ContentItem) {
  if (!ID_RE.test(item.id)) {
    throw new Error(
      `Invalid id format: "${item.id}"\n` +
      `Expected: type__slug__yyyy or type__slug__yyyy-mm\n` +
      `Allowed type prefixes: project, exp, edu, skill, cert, plan, activity, volunteer`
    );
  }
}

export function validateDates(item: ContentItem) {
  // Basic sanity: if end exists, end >= start lexicographically (YYYY-MM or YYYY-MM-DD)
  if (item.date?.start && item.date?.end && item.date.end < item.date.start) {
    throw new Error(`Invalid date range for "${item.id}": end < start`);
  }
}
