"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { RelationSuggestion } from "@/lib/ai/schemas";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

export function RelationEditModal({
  relation,
  onClose,
  onSave,
}: {
  relation: RelationSuggestion;
  onClose: () => void;
  onSave: (relation: RelationSuggestion) => void;
}) {
  const [draft, setDraft] = useState(relation);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="glass-strong w-full max-w-lg rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Edit relation</h2>
          <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <input className={inputClass} value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} />
          <select className={inputClass} value={draft.stance} onChange={(event) => setDraft({ ...draft, stance: event.target.value as RelationSuggestion["stance"] })}>
            <option value="ally">ally</option>
            <option value="lean ally">lean ally</option>
            <option value="neutral">neutral</option>
            <option value="lean opposed">lean opposed</option>
            <option value="opposed">opposed</option>
          </select>
          <input className={inputClass} type="number" min={0} max={100} value={draft.confidence} onChange={(event) => setDraft({ ...draft, confidence: Number(event.target.value) })} />
          <input className={inputClass} value={draft.bloc ?? ""} onChange={(event) => setDraft({ ...draft, bloc: event.target.value })} placeholder="Bloc" />
          <textarea className={`${inputClass} min-h-24`} value={draft.rationale} onChange={(event) => setDraft({ ...draft, rationale: event.target.value })} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </div>
      </div>
    </div>
  );
}
