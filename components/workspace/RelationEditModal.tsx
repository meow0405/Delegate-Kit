"use client";

import { useEffect, useRef, useState } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="relation-dialog-title" tabIndex={-1} className="glass-strong w-full max-w-lg rounded-lg p-5 outline-none">
        <div className="flex items-center justify-between gap-3">
          <h2 id="relation-dialog-title" className="text-lg font-bold text-ink">Edit relation</h2>
          <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-muted">Portfolio<input className={inputClass} value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-muted">Relationship<select className={inputClass} value={draft.stance} onChange={(event) => setDraft({ ...draft, stance: event.target.value as RelationSuggestion["stance"] })}>
            <option value="ally">ally</option>
            <option value="lean ally">lean ally</option>
            <option value="neutral">neutral</option>
            <option value="lean opposed">lean opposed</option>
            <option value="opposed">opposed</option>
          </select></label>
          <label className="grid gap-2 text-sm font-semibold text-muted">Confidence<input className={inputClass} type="number" min={0} max={100} value={draft.confidence} onChange={(event) => setDraft({ ...draft, confidence: Number(event.target.value) })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-muted">Bloc<input className={inputClass} value={draft.bloc ?? ""} onChange={(event) => setDraft({ ...draft, bloc: event.target.value })} placeholder="Global South coalition" /></label>
          <label className="grid gap-2 text-sm font-semibold text-muted">Rationale<textarea className={`${inputClass} min-h-24`} value={draft.rationale} onChange={(event) => setDraft({ ...draft, rationale: event.target.value })} /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save relation</Button>
        </div>
      </div>
    </div>
  );
}
