"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, FolderOpen, Gavel, Landmark, Plus, Search, Trash2, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { DriveConnectButton } from "@/components/ui/DriveConnectButton";
import { BrandMark, MunGlyph } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ErrorNotice } from "@/components/ui/ActionStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";

export function Dashboard() {
  const kits = useDelegateStore((state) => state.kits);
  const setKits = useDelegateStore((state) => state.setKits);
  const resetDraft = useDelegateStore((state) => state.resetDraft);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState("");
  const [loadedAt, setLoadedAt] = useState<Date>();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string }>();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredKits = useMemo(() => kits.filter((kit) => [kit.name, kit.country, kit.committee, kit.topic].some((value) => value.toLowerCase().includes(normalizedQuery))), [kits, normalizedQuery]);
  const speechCount = useMemo(() => kits.reduce((total, kit) => total + (kit.speeches?.length ?? 0), 0), [kits]);
  const createdThisMonth = useMemo(() => kits.filter((kit) => kit.createdAt && new Date(kit.createdAt).getMonth() === new Date().getMonth() && new Date(kit.createdAt).getFullYear() === new Date().getFullYear()).length, [kits]);

  async function deleteKit(kitId: string) {
    try {
      const response = await fetch(`/api/kits/${kitId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getActionError(response, "delete this kit"));
      setKits(kits.filter((kit) => kit.id !== kitId));
      setPendingDelete(undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "delete this kit"));
    }
  }

  useEffect(() => {
    fetch("/api/kits")
      .then(async (response) => {
        if (!response.ok) throw new Error(await getActionError(response, "load your kits"));
        return response.json();
      })
      .then((data) => {
        setKits(data.kits ?? []);
        setLoadedAt(new Date());
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : getNetworkError(caught, "load your kits")))
      .finally(() => setLoading(false));
  }, [setKits]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="app-header flex flex-wrap items-center justify-between gap-3">
        <BrandMark />
        <ThemeToggle />
      </header>

      <section className="glass brand-panel hero-panel grid min-w-0 gap-8 rounded-lg p-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-stretch lg:p-7">
        <div className="relative z-10 flex min-w-0 flex-col justify-between gap-12 py-3">
          <div className="space-y-8">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <p className="eyebrow break-words text-muted">Delegate_Kit / Local_Dossier</p>
              <p className="eyebrow text-soft">2026</p>
            </div>
            <div className="space-y-6">
              <h1 className="hero-title max-w-3xl text-ink">
                Delegate<br />
                <span className="gradient-text">Kit</span>
              </h1>
              <p className="max-w-full font-mono text-xs uppercase leading-6 tracking-[0.2em] text-soft">
                Research / Blocs / Speeches / Papers
              </p>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">
              A polished local workspace for country research, bloc strategy, speeches, and position papers.
            </p>
          </div>

          <div className="space-y-7">
            <div className="grid max-w-lg grid-cols-3 gap-4" aria-label="Workspace status">
              <div className="hero-stat pt-3">
                <p className="text-2xl font-semibold text-ink">{kits.length.toLocaleString()}</p>
                <p className="mt-1 text-xs">saved kits</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600"><ArrowUpRight size={12} />{createdThisMonth} this month</p>
              </div>
              <div className="hero-stat pt-3">
                <p className="text-2xl font-semibold text-ink">{speechCount.toLocaleString()}</p>
                <p className="mt-1 text-xs">saved speeches</p>
                <p className="mt-2 text-[11px] text-soft">Across all kits</p>
              </div>
              <div className="hero-stat pt-3">
                <p className="text-base font-semibold text-ink">{loadedAt ? "Current" : "Checking"}</p>
                <p className="mt-1 text-xs">library status</p>
                <p className="mt-2 text-[11px] text-soft">{loadedAt ? "Updated just now" : "Connecting locally"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:flex sm:flex-row">
              <Link href="/kit/setup" onClick={resetDraft} className="focus-ring inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] shadow-lg transition hover:opacity-90 active:translate-y-px sm:w-auto">
                <Plus size={16} />
                New kit
              </Link>
              <DriveConnectButton />
            </div>
          </div>
        </div>

        <div className="editorial-frame relative z-10 min-w-0 rounded-lg" aria-hidden="true">
          <span className="editorial-number">01</span>
          <span className="specimen-word left-8 top-10">Out</span>
          <span className="specimen-word bottom-0 right-5">Office</span>
          <div className="brand-mark-large">
            <MunGlyph size={165} />
          </div>
          <div className="registration-mark right-8 top-8"><span /></div>
          <div className="registration-mark bottom-10 left-10"><span /></div>
          <div className="mini-photo left-8 top-16 h-28 w-24">
            <UsersRound size={34} />
          </div>
          <div className="mini-photo light right-12 top-28 h-24 w-36">
            <Landmark size={34} />
          </div>
          <div className="mini-photo bottom-20 left-[33%] h-36 w-28">
            <Gavel size={34} />
          </div>
          <div className="mini-photo light bottom-28 right-20 h-24 w-24">
            <FolderOpen size={30} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-soft">Saved work</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Your kits</h2>
          </div>
          {kits.length ? (
            <label className="relative block w-full sm:w-80">
              <span className="sr-only">Search saved kits</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
              <input className="focus-ring input-surface min-h-11 w-full rounded-md py-2 pl-10 pr-10 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search India, UN Women, or AI governance" type="search" />
              {query ? <button type="button" className="icon-button absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setQuery("")} aria-label="Clear kit search"><X size={15} /></button> : null}
            </label>
          ) : null}
        </div>
        {normalizedQuery ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{filteredKits.length.toLocaleString()} {filteredKits.length === 1 ? "result" : "results"} for &quot;{query.trim()}&quot;</p>
            <button type="button" className="feedback-button" onClick={() => setQuery("")}><X size={14} />Clear search</button>
          </div>
        ) : kits.length ? <p className="text-sm text-soft">{kits.length.toLocaleString()} saved {kits.length === 1 ? "workspace" : "workspaces"}</p> : null}
        <ErrorNotice message={error} onRetry={() => window.location.reload()} />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Loading saved kits">
            {[0, 1, 2].map((item) => <div key={item} className="glass-strong h-48 animate-pulse rounded-lg" />)}
          </div>
        ) : kits.length === 0 ? (
          <EmptyState title="Your delegate folder is empty" description="Create a kit to keep portfolio research, speeches, blocs, and exports together." action={<Link href="/kit/setup" onClick={resetDraft} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] shadow-lg transition hover:opacity-90"><Plus size={16} />Create your first kit</Link>} />
        ) : filteredKits.length === 0 ? (
          <EmptyState title="No kits match this search" description={`No saved workspace matches "${query.trim()}". Clear the search to return to all kits.`} action={<button type="button" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)]" onClick={() => setQuery("")}>Clear search</button>} />
        ) : (
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 md:grid-cols-3" tabIndex={0} aria-label="Saved kits">
            {filteredKits.map((kit) => (
              <article key={kit.id} className="glass-strong kit-card group relative rounded-lg p-5 pl-7 transition hover:-translate-y-0.5 hover:border-pink-300/60">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-pink-400/20 via-cyan-300/20 to-yellow-200/25 text-[var(--accent)]">
                    <FileText size={21} />
                  </div>
                  <button
                    type="button"
                    className="focus-ring relative z-10 rounded-md p-2 text-soft transition hover:bg-[var(--tile)] hover:text-rose-500"
                    aria-label={`Delete ${kit.name}`}
                    onClick={() => setPendingDelete({ id: kit.id, name: kit.name })}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <Link href={`/workspace?kit=${kit.id}`} className="focus-ring block rounded-md" aria-label={`Open ${kit.name}`}>
                  <h3 className="text-lg font-semibold leading-snug text-ink group-hover:gradient-text">{kit.name}</h3>
                  <p className="mt-3 text-sm text-soft">{kit.country} in {kit.committee}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{kit.topic}</p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      {pendingDelete ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(undefined); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="delete-kit-title" className="glass-strong w-full max-w-md rounded-lg p-5">
          <h2 id="delete-kit-title" className="text-lg font-semibold text-ink">Delete {pendingDelete.name}?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">This permanently removes the kit and its saved workspace data. This action cannot be undone.</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" className="focus-ring min-h-11 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-[var(--tile)]" onClick={() => setPendingDelete(undefined)}>Keep kit</button>
            <button type="button" className="focus-ring min-h-11 rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600" onClick={() => void deleteKit(pendingDelete.id)}>Delete kit</button>
          </div>
        </div>
      </div> : null}
    </main>
  );
}
