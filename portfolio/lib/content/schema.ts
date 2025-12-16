import { z } from "zod";

export const DOMAIN_VOCAB = [
  "ml",
  "computer-vision",
  "data-engineering",
  "devops",
  "cloud",
  "frontend",
  "embedded",
  "iot",
  "research",
  "trading",
  "creative",
  "support",
  "retail",
  "leadership",
  "events",
] as const;

export const ImportanceEnum = z.enum(["featured", "standard", "mini"]);

export const DateRangeSchema = z.object({
  start: z.string().default(""),
  end: z.string().default(""),
});

export const ContentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  date: DateRangeSchema,
  summary: z.string().min(1),
  domains: z.array(z.enum(DOMAIN_VOCAB)).default([]),
  tags: z.array(z.string()).default([]),
  importance: ImportanceEnum,
  links: z.record(z.string()).default({}),
});

export type ContentItem = z.infer<typeof ContentItemSchema>;

// Collections can be arrays of ContentItem
export const ContentCollectionSchema = z.array(ContentItemSchema);
