"use client";

import { RefreshCw, Wand2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";
import type { RelationSuggestion } from "@/lib/ai/schemas";

const stanceOrder: Record<RelationSuggestion["stance"], number> = {
  ally: 0,
  "lean ally": 1,
  neutral: 2,
  "lean opposed": 3,
  opposed: 4,
};

export function BlocsAndSeatingTab() {
  const kit = useDelegateStore((state) => state.activeKit);
  const draft = useDelegateStore((state) => state.draft);
  const relations = useDelegateStore((state) => state.relations);
  const setRelations = useDelegateStore((state) => state.setRelations);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const requestRef = useRef<AbortController | null>(null);
  const roster = kit?.roster?.length ? kit.roster : draft.roster;
  const rows = useMemo(
    () => (relations.length ? relations : (kit?.relations as RelationSuggestion[] | undefined) ?? []),
    [kit?.relations, relations],
  );
  const seatingRows = useMemo(
    () => [...rows].sort((a, b) => stanceOrder[a.stance] - stanceOrder[b.stance] || b.confidence - a.confidence),
    [rows],
  );
  const blocs = useMemo(() => {
    return rows.reduce<Record<string, RelationSuggestion[]>>((acc, relation) => {
      const key = relation.bloc || "Unassigned";
      acc[key] = [...(acc[key] ?? []), relation];
      return acc;
    }, {});
  }, [rows]);

  async function generateRelations() {
    if (!kit) return;
    requestRef.current?.abort();
    requestRef.current = new AbortController();
    setBusy(true);
    setError(undefined);
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
        signal: requestRef.current.signal,
      });
      if (!response.ok) throw new Error(await getActionError(response, "generate coalition blocs"));
      const data = await response.json();
      if (!Array.isArray(data.suggestions)) throw new Error("The model returned an incomplete bloc map. Try again with a shorter roster.");
      setRelations(data.suggestions ?? []);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === "AbortError" ? undefined : caught instanceof Error ? caught.message : getNetworkError(caught, "generate coalition blocs"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-strong rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Bloc map</h2>
            <p className="mt-1 text-sm text-soft">Caucus groups built from stance, law, policy, and implementation logic.</p>
          </div>
          <Button onClick={generateRelations} disabled={!kit || busy}>
            {busy ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {busy ? "Building blocs" : "Generate blocs"}
          </Button>
        </div>
        <ActionProgress active={busy} label="Building coalition blocs" onCancel={() => requestRef.current?.abort()} />
        <ErrorNotice message={error} onRetry={generateRelations} />
        {rows.length ? (
          <div className="mt-5 grid gap-4">
            {Object.entries(blocs).map(([bloc, members]) => (
              <div key={bloc} className="surface-tile rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-[var(--accent)]">{bloc}</h3>
                  <span className="rounded-full bg-[var(--foreground)] px-2 py-1 text-xs font-semibold text-[var(--background)]">
                    {members.length}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{members.map((member) => member.country).join(", ")}</p>
                <div className="mt-3 grid gap-2">
                  {members.slice(0, 3).map((member) => (
                    <p key={member.country} className="border-l border-[var(--line)] pl-3 text-xs leading-5 text-muted">
                      <span className="font-semibold text-ink">{member.country}:</span> {member.rationale}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5"><EmptyState title="No coalition blocs yet" description="Generate relations to group portfolios by stance, policy, and implementation interests." action={<Button onClick={generateRelations} disabled={!kit || busy}>Generate blocs</Button>} /></div>
        )}
      </div>
      <div className="glass-strong rounded-lg p-5">
        <h2 className="text-lg font-bold text-ink">Seating signal</h2>
        {rows.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {seatingRows.map((relation) => (
              <div key={relation.country} className="surface-tile rounded-lg p-3 text-center">
                <div className="mx-auto mb-2 h-2 w-12 rounded-full bg-gradient-to-r from-pink-400 to-cyan-300" style={{ opacity: Math.max(0.25, relation.confidence / 100) }} />
                <p className="text-sm font-bold text-ink">{relation.country}</p>
                <p className="mt-1 text-xs text-soft">{relation.stance}</p>
                <p className="mt-1 text-[11px] text-soft">{relation.bloc ?? "Unassigned"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5"><EmptyState title="No seating signal yet" description="Seating suggestions appear after relation data has been generated." /></div>
        )}
      </div>
    </section>
  );
}
