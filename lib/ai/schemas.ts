import { z } from "zod";

export const countryIntelSchema = z.object({
  summary: z.string(),
  priorities: z.array(z.string()).default([]),
  redLines: z.array(z.string()).default([]),
  allies: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
});

export const relationSuggestionSchema = z.object({
  country: z.string(),
  stance: z.enum(["ally", "lean ally", "neutral", "lean opposed", "opposed"]),
  confidence: z.number().int().min(0).max(100),
  rationale: z.string(),
  bloc: z.string().optional(),
});

export const relationsSuggestionSchema = z.object({
  suggestions: z.array(relationSuggestionSchema),
});

export const newsItemSchema = z.object({
  title: z.string(),
  source: z.string(),
  url: z.string().optional(),
  publishedAt: z.string().optional(),
  summary: z.string(),
  relevance: z.number().min(0).max(1).default(0.5),
});

export const newsDigestSchema = z.object({
  query: z.string(),
  items: z.array(newsItemSchema),
});

export const speechSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  style: z.string().optional(),
  seconds: z.number().int().optional(),
  focus: z.string().optional(),
  title: z.string(),
  body: z.string(),
  talkingPoints: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  wordCount: z.number().int().optional(),
  estimatedSeconds: z.number().int().optional(),
});

export const committeeContextSchema = z.object({
  mandate: z.string(),
  proceduralNotes: z.array(z.string()),
  likelyFaultLines: z.array(z.string()),
});

export const stanceAnalysisSchema = z.object({
  stance: z.enum(["support", "neutral", "oppose", "mixed"]),
  confidence: z.number().int().min(0).max(100),
  summary: z.string(),
  reasoning: z.array(z.string()).default([]),
  lawsAndPolicies: z
    .array(
      z.object({
        name: z.string(),
        relevance: z.string(),
      }),
    )
    .default([]),
  likelyArguments: z.array(z.string()).default([]),
  detectedIssues: z.array(z.string()).default([]),
  suggestedImprovements: z.array(z.string()).default([]),
  cautions: z.array(z.string()).default([]),
  provider: z.string().optional(),
});

export type CountryIntel = z.infer<typeof countryIntelSchema>;
export type RelationSuggestion = z.infer<typeof relationSuggestionSchema>;
export type NewsDigest = z.infer<typeof newsDigestSchema>;
export type SpeechDraft = z.infer<typeof speechSchema>;
export type CommitteeContext = z.infer<typeof committeeContextSchema>;
export type StanceAnalysis = z.infer<typeof stanceAnalysisSchema>;
