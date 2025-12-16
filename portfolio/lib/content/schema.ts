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

const DomainSchema = z
  .string()
  .refine((d) => (DOMAIN_VOCAB as readonly string[]).includes(d), {
    message: `Domain must be one of: ${DOMAIN_VOCAB.join(", ")}`,
  });

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
  domains: z.array(DomainSchema).default([]),
  tags: z.array(z.string()).default([]),
  importance: ImportanceEnum,
  links: z.record(z.string(), z.string()).default({}),
});


export type ContentItem = z.infer<typeof ContentItemSchema>;
export const ContentCollectionSchema = z.array(ContentItemSchema);
