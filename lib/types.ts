import type { CountryIntel, RelationSuggestion, SpeechDraft } from "@/lib/ai/schemas";

export type Kit = {
  id: string;
  name: string;
  committee: string;
  committeeDescription?: string | null;
  country: string;
  topic: string;
  notes?: string | null;
  roster?: string[];
  intel?: (CountryIntel & { id?: string }) | null;
  relations?: RelationSuggestion[];
  speeches?: SpeechDraft[];
  exports?: { id: string; filename: string; path: string; driveFileId?: string | null }[];
};
