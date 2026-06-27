"use client";

import { ArrowDown, ArrowUp, Edit3, RefreshCw, Search, Wand2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";
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
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState("");
  const [stanceFilter, setStanceFilter] = useState<"all" | RelationSuggestion["stance"]>("all");
  const [sort, setSort] = useState<{ key: "country" | "confidence" | "bloc"; direction: "asc" | "desc" }>({ key: "confidence", direction: "desc" });
  const [page, setPage] = useState(1);
  const requestRef = useRef<AbortController | null>(null);
  const roster = kit?.roster?.length ? kit.roster : draft.roster;

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
      if (!response.ok) throw new Error(await getActionError(response, "suggest portfolio relations"));
      const data = await response.json();
      if (!Array.isArray(data.suggestions)) throw new Error("The model returned an incomplete relation matrix. Try again with a shorter roster.");
      setRelations(data.suggestions ?? []);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === "AbortError" ? undefined : caught instanceof Error ? caught.message : getNetworkError(caught, "suggest portfolio relations"));
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => relations.length ? relations : (kit?.relations as RelationSuggestion[] | undefined) ?? [], [kit?.relations, relations]);
  const pageSize = 20;
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows
      .filter((relation) => stanceFilter === "all" || relation.stance === stanceFilter)
      .filter((relation) => !normalized || [relation.country, relation.stance, relation.bloc ?? "", relation.rationale].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => {
        const left = sort.key === "confidence" ? a.confidence : sort.key === "bloc" ? a.bloc ?? "" : a.country;
        const right = sort.key === "confidence" ? b.confidence : sort.key === "bloc" ? b.bloc ?? "" : b.country;
        const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
        return sort.direction === "asc" ? comparison : -comparison;
      });
  }, [query, rows, sort, stanceFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeSort(key: "country" | "confidence" | "bloc") {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
    setPage(1);
  }

  function renderSortLabel(column: "country" | "confidence" | "bloc", label: string) {
    const active = sort.key === column;
    return <button type="button" className="focus-ring inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold text-ink" onClick={() => changeSort(column)}>{label}{active ? sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <span className="text-[10px] text-soft" aria-hidden="true">Sort</span>}</button>;
  }

  return (
    <section className="glass-strong rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Relations matrix</h2>
          <p className="mt-1 text-sm text-soft">Generate coalition posture, blocs, and legal-policy rationale for {roster.length} roster entries.</p>
        </div>
        <Button onClick={generateRelations} disabled={!kit || busy}>
          {busy ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {busy ? "Building matrix" : "Suggest relations"}
        </Button>
      </div>
      <ActionProgress active={busy} label="Building the relations matrix" onCancel={() => requestRef.current?.abort()} />
      <ErrorNotice message={error} onRetry={generateRelations} />
      {rows.length ? (
        <div className="mt-5 grid gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="relative min-w-0 flex-1 sm:min-w-64">
              <span className="mb-2 block text-sm font-semibold text-muted">Search relations</span>
              <Search size={16} className="pointer-events-none absolute bottom-3 left-3 text-soft" />
              <input type="search" className="focus-ring input-surface min-h-11 w-full rounded-md py-2 pl-10 pr-3 text-sm" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search Brazil, ally, or climate bloc" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Relationship
              <select className="focus-ring input-surface min-h-11 rounded-md px-3 py-2 text-sm" value={stanceFilter} onChange={(event) => { setStanceFilter(event.target.value as typeof stanceFilter); setPage(1); }}>
                <option value="all">All relationships</option>
                {Object.keys(stanceStyles).map((stance) => <option key={stance} value={stance}>{stance}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} relations</p>
            {query || stanceFilter !== "all" ? <div className="flex flex-wrap gap-2">
              {query ? <button type="button" className="feedback-button" onClick={() => { setQuery(""); setPage(1); }}>Search: {query.trim()} <X size={13} /></button> : null}
              {stanceFilter !== "all" ? <button type="button" className="feedback-button" onClick={() => { setStanceFilter("all"); setPage(1); }}>Relationship: {stanceFilter} <X size={13} /></button> : null}
              <button type="button" className="feedback-button" onClick={() => { setQuery(""); setStanceFilter("all"); setPage(1); }}>Clear filters</button>
            </div> : null}
          </div>
        {filteredRows.length ? <>
        <div className="max-h-[70vh] overflow-auto" tabIndex={0} aria-label="Relations matrix table">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--panel-strong)] text-soft">
              <tr>
                <th className="px-3 py-2" aria-sort={sort.key === "country" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{renderSortLabel("country", "Portfolio")}</th>
                <th className="px-3 py-2">Stance</th>
                <th className="px-3 py-2 text-right" aria-sort={sort.key === "confidence" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{renderSortLabel("confidence", "Confidence")}</th>
                <th className="px-3 py-2" aria-sort={sort.key === "bloc" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{renderSortLabel("bloc", "Bloc")}</th>
                <th className="px-3 py-2">Rationale</th>
                <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((relation) => (
                <tr key={relation.country} className="surface-tile">
                  <td className="rounded-l-md px-3 py-3 font-bold text-ink">{relation.country}</td>
                  <td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-xs ${stanceStyles[relation.stance]}`}>{relation.stance}</span></td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{relation.confidence}%</td>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
          <p className="text-sm text-soft">Page {currentPage} of {totalPages} | {filteredRows.length.toLocaleString()} total results</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</Button>
            <label className="flex items-center gap-2 text-sm text-muted">Page<select className="focus-ring input-surface min-h-11 rounded-md px-2" value={currentPage} onChange={(event) => setPage(Number(event.target.value))}>{Array.from({ length: totalPages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
            <Button variant="secondary" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
        </> : <EmptyState title="No relations match these filters" description="Clear the active search or relationship filter to return to the full matrix." action={<button type="button" className="focus-ring inline-flex min-h-11 items-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)]" onClick={() => { setQuery(""); setStanceFilter("all"); setPage(1); }}>Clear filters</button>} />}
        </div>
      ) : (
        <div className="mt-5"><EmptyState title="No relation matrix yet" description="Generate coalition posture, confidence, blocs, and policy rationale for every roster entry." action={<Button onClick={generateRelations} disabled={!kit || busy}>Suggest relations</Button>} /></div>
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
