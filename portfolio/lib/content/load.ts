import fs from "node:fs";
import path from "node:path";
import { ContentCollectionSchema, type ContentItem } from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(fileName: string): T {
  const fullPath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

export function loadCollection(fileName: string): ContentItem[] {
  const data = readJson<unknown>(fileName);
  return ContentCollectionSchema.parse(data);
}

export function loadAllContent() {
  // Only collections that follow ContentItem schema live here.
  // profile/links can be separate schemas later; for now keep them simple.
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
