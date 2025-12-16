import fs from "node:fs";
import path from "node:path";
import { ContentCollectionSchema, type ContentItem } from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(fileName: string): T {
  const fullPath = path.join(CONTENT_DIR, fileName);

  let raw = "";
  try {
    raw = fs.readFileSync(fullPath, "utf8");
  } catch (e) {
    throw new Error(`Failed to read content file: ${fileName}\nPath: ${fullPath}\n${String(e)}`);
  }

  // Catch empty/whitespace-only files early
  if (!raw.trim()) {
    throw new Error(`Content file is empty: ${fileName}\nPath: ${fullPath}`);
  }

  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(
      `Invalid JSON in: ${fileName}\nPath: ${fullPath}\nError: ${String(e)}\n` +
      `Tip: ensure it starts with '[' and ends with ']' for collections.`
    );
  }
}

export function loadCollection(fileName: string): ContentItem[] {
  const data = readJson<unknown>(fileName);
  return ContentCollectionSchema.parse(data);
}

export function loadAllContent() {
  const projects = loadCollection("projects.json");
  const experience = loadCollection("experience.json");
  const education = loadCollection("education.json");
  const skills = loadCollection("skills.json");
  const certifications = loadCollection("certifications.json");
  const plans = loadCollection("plans.json");
  const activities = loadCollection("activities.json");
  const volunteering = loadCollection("volunteering.json");

  return {
    projects,
    experience,
    education,
    skills,
    certifications,
    plans,
    activities,
    volunteering,
  };
}
