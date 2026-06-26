"use client";

import { Edit3, RefreshCw, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDelegateStore } from "@/lib/store/delegateStore";
import type { RelationSuggestion } from "@/lib/ai/schemas";
import { RelationEditModal } from "./RelationEditModal";

const stanceStyles: Record<string, string> = {
  ally: "bg-emerald-300 text-emerald-950",
  "lean ally": "bg-cyan-300 text-cyan-950",
  neutral: "bg-slate-300 text-slate-950",
  "lean opposed": "bg-amber-300 text-amber-950",
  opposed: "bg-rose-300 text-rose-950",
};

export function MatrixTab() {
  const kit = useDelegateStore((state) => state.activeKit);
  const draft = useDelegateStore((state) => state.draft);
  const relations = useDelegateStore((state) => state.relations);
  const setRelations = useDelegateStore((state) => state.setRelations);
  const updateRelation = useDelegateStore((state) => state.updateRelation);
  const [editing, setEditing] = useState<RelationSuggestion>();
  const [busy, setBusy] = useState(false);
  const roster = kit?.roster?.length ? kit.roster : draft.roster;

  async function generateRelations() {
    if (!kit) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId: kit.id,
          country: kit.country,
          committee: kit.committee,
          topic: kit.topic,
          roster,
        }),
      });
      const data = await response.json();
      setRelations(data.suggestions ?? []);
    } finally {
      setBusy(false);
    }
  }

  const rows = relations.length ? relations : (kit?.relations as RelationSuggestion[] | undefined) ?? [];

  return (
    <section className="glass-strong rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Relations matrix</h2>
          <p className="mt-1 text-sm text-soft">Generate coalition posture, blocs, and legal-policy rationale for {roster.length} roster entries.</p>
        </div>
        <Button onClick={generateRelations} disabled={!kit || busy}>
          {busy ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
          Suggest relations
        </Button>
      </div>
      {rows.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-soft">
              <tr>
                <th className="px-3 py-2">Portfolio</th>
                <th className="px-3 py-2">Stance</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Bloc</th>
                <th className="px-3 py-2">Rationale</th>
                <th className="px-3 py-2">Edit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((relation) => (
                <tr key={relation.country} className="surface-tile">
                  <td className="rounded-l-md px-3 py-3 font-bold text-ink">{relation.country}</td>
                  <td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-xs ${stanceStyles[relation.stance]}`}>{relation.stance}</span></td>
                  <td className="px-3 py-3 text-muted">{relation.confidence}%</td>
                  <td className="px-3 py-3 text-muted">{relation.bloc ?? "Unassigned"}</td>
                  <td className="px-3 py-3 text-muted">
                    <p className="max-w-xl leading-6">{relation.rationale}</p>
                  </td>
                  <td className="rounded-r-md px-3 py-3">
                    <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => setEditing(relation)} aria-label={`Edit ${relation.country}`}>
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="surface-tile mt-5 rounded-lg p-5">
          <p className="text-sm font-semibold text-ink">No relation matrix yet.</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Click <span className="font-semibold text-ink">Suggest relations</span> to generate portfolio stances from your roster.
          </p>
        </div>
      )}
      {editing ? (
        <RelationEditModal
          relation={editing}
          onClose={() => setEditing(undefined)}
          onSave={(relation) => {
            updateRelation(editing.country, relation);
            setEditing(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
