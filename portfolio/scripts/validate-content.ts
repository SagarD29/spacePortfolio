import { loadAllContent } from "../lib/content/load";
import { validateDates, validateIdFormat } from "../lib/content/normalize";

function main() {
  const all = loadAllContent();

  const allItems = [
    all.profile,
    ...all.projects,
    ...all.experience,
    ...all.education,
    ...all.skills,
    ...all.certifications,
    ...all.plans,
    ...all.activities,
    ...all.volunteering,
  ];

  // Duplicate ID detection
  const ids = allItems.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) {
    console.error("Duplicate IDs found:", Array.from(new Set(dupes)));
    process.exit(1);
  }

  for (const item of allItems) {
    validateIdFormat(item);
    validateDates(item);
  }

  console.log("✅ Content valid. Counts:", {
    profile: 1,
    projects: all.projects.length,
    experience: all.experience.length,
    education: all.education.length,
    skills: all.skills.length,
    certifications: all.certifications.length,
    plans: all.plans.length,
    activities: all.activities.length,
    volunteering: all.volunteering.length,
  });
}

main();
