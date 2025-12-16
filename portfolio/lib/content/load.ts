import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  ContentCollectionSchema,
  ContentItemSchema,
  type ContentItem,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson(fileName: string): unknown {
  const fullPath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  if (!raw.trim()) throw new Error(`Content file is empty: ${fileName} (${fullPath})`);
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${fileName} (${fullPath}): ${String(e)}`);
  }
}

function parseWithFile<T>(schema: z.ZodType<T>, fileName: string): T {
  const data = readJson(fileName);
  const result = schema.safeParse(data);
  if (!result.success) {
    const pretty = result.error.issues
      .map((i) => `- ${fileName} @ ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Content validation failed:\n${pretty}`);
  }
  return result.data;
}

// Collections
export function loadCollection(fileName: string): ContentItem[] {
  return parseWithFile(ContentCollectionSchema, fileName);
}

// Singles / utility objects
export function loadProfile() {
  return parseWithFile(ContentItemSchema, "profile.json");
}

export function loadLinks() {
  // keep links.json flexible; you can tighten later if you want
  return parseWithFile(z.record(z.string(), z.string()), "links.json");
}

export function loadAllContent() {
  return {
    profile: loadProfile(),
    links: loadLinks(),
    projects: loadCollection("projects.json"),
    experience: loadCollection("experience.json"),
    education: loadCollection("education.json"),
    skills: loadCollection("skills.json"),
    certifications: loadCollection("certifications.json"),
    plans: loadCollection("plans.json"),
    activities: loadCollection("activities.json"),
    volunteering: loadCollection("volunteering.json"),
  };
}
