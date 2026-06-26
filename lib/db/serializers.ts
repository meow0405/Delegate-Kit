import type { RelationSuggestion } from "@/lib/ai/schemas";
import { decodeKitNotes } from "@/lib/db/kitNotes";
import type { Kit } from "@/lib/types";

type PersistedKit = {
  id: string;
  name: string;
  committee: string;
  committeeDescription?: string | null;
  country: string;
  topic: string;
  notes?: string | null;
  exports?: Kit["exports"];
  speeches?: Array<{
    id: string;
    type: string;
    style?: string | null;
    seconds?: number | null;
    focus?: string | null;
    title: string;
    body: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }>;
  relations?: Array<{
    country: string;
    stance: unknown;
    confidence: number;
    rationale: string;
    bloc?: string | null;
  }>;
  intel?: {
    id?: string;
    summary: string;
    priorities: unknown;
    redLines: unknown;
    allies: unknown;
    risks: unknown;
    sources: unknown;
  } | null;
};

const stances = ["ally", "lean ally", "neutral", "lean opposed", "opposed"] as const;

function parseStance(value: unknown): RelationSuggestion["stance"] {
  return typeof value === "string" && stances.includes(value as RelationSuggestion["stance"])
    ? (value as RelationSuggestion["stance"])
    : "neutral";
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

export function serializeKit(kit: PersistedKit): Kit {
  const notes = decodeKitNotes(kit.notes);

  return {
    ...kit,
    notes: notes.text ?? "",
    roster: notes.roster ?? [],
    speeches: (kit.speeches ?? []).map((speech) => ({
      id: speech.id,
      type: speech.type,
      style: speech.style ?? undefined,
      seconds: speech.seconds ?? undefined,
      focus: speech.focus ?? undefined,
      title: speech.title,
      body: speech.body,
      talkingPoints: [],
      createdAt: speech.createdAt ? new Date(speech.createdAt).toISOString() : undefined,
      updatedAt: speech.updatedAt ? new Date(speech.updatedAt).toISOString() : undefined,
    })),
    relations: (kit.relations ?? []).map((relation) => ({
      country: relation.country,
      stance: parseStance(relation.stance),
      confidence: relation.confidence,
      rationale: relation.rationale,
      bloc: relation.bloc ?? undefined,
    })),
    intel: kit.intel
      ? {
          ...kit.intel,
          priorities: parseList(kit.intel.priorities),
          redLines: parseList(kit.intel.redLines),
          allies: parseList(kit.intel.allies),
          risks: parseList(kit.intel.risks),
          sources: parseList(kit.intel.sources),
        }
      : null,
  };
}
