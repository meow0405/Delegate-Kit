type KitNotesMeta = {
  text?: string;
  roster?: string[];
};

export function encodeKitNotes(input: { notes?: string | null; roster?: string[] | null }) {
  return JSON.stringify({
    text: input.notes ?? "",
    roster: input.roster ?? [],
  } satisfies KitNotesMeta);
}

export function decodeKitNotes(value?: string | null): KitNotesMeta {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as KitNotesMeta;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      roster: Array.isArray(parsed.roster) ? parsed.roster.map(String).filter(Boolean) : [],
    };
  } catch {
    return { text: value, roster: [] };
  }
}
