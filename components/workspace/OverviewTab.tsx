"use client";

import { Brain, Gavel, Newspaper, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { AiFeedback } from "@/components/ui/AiFeedback";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";
import { SpeechGenerator } from "./SpeechGenerator";
import { ExportPdfButton } from "./ExportPdfButton";
import { DriveConnectButton } from "@/components/ui/DriveConnectButton";
import { ResearchLibrary } from "./ResearchLibrary";

export function OverviewTab() {
  const kit = useDelegateStore((state) => state.activeKit);
  const intel = useDelegateStore((state) => state.intel) ?? kit?.intel;
  const news = useDelegateStore((state) => state.news);
  const stance = useDelegateStore((state) => state.stance);
  const setIntel = useDelegateStore((state) => state.setIntel);
  const setNews = useDelegateStore((state) => state.setNews);
  const setStance = useDelegateStore((state) => state.setStance);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [lastAction, setLastAction] = useState<"intel" | "stance" | "news">();
  const requestRef = useRef<AbortController | null>(null);

  function beginRequest(action: "intel" | "stance" | "news") {
    requestRef.current?.abort();
    requestRef.current = new AbortController();
    setBusy(action);
    setLastAction(action);
    setError(undefined);
    return requestRef.current.signal;
  }

  function cancelRequest() {
    requestRef.current?.abort();
    setBusy(undefined);
  }

  async function runIntel() {
    if (!kit) return;
    const signal = beginRequest("intel");
    try {
      const response = await fetch("/api/ai/country-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: kit.id, country: kit.country, committee: kit.committee, topic: kit.topic }),
        signal,
      });

      if (!response.ok) throw new Error(await getActionError(response, "generate portfolio intelligence"));
      setIntel(await response.json());
    } catch (err) {
      setError(err instanceof DOMException && err.name === "AbortError" ? undefined : err instanceof Error ? err.message : getNetworkError(err, "generate portfolio intelligence"));
    } finally {
      setBusy(undefined);
    }
  }

  async function runNews() {
    if (!kit) return;
    const signal = beginRequest("news");
    try {
      const response = await fetch("/api/ai/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: kit.id, query: `${kit.topic} ${kit.country}` }),
        signal,
      });

      if (!response.ok) throw new Error(await getActionError(response, "refresh the news digest"));
      setNews(await response.json());
    } catch (err) {
      setError(err instanceof DOMException && err.name === "AbortError" ? undefined : err instanceof Error ? err.message : getNetworkError(err, "refresh the news digest"));
    } finally {
      setBusy(undefined);
    }
  }

  async function runStance() {
    if (!kit) return;
    const signal = beginRequest("stance");
    try {
      const response = await fetch("/api/ai/stance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId: kit.id,
          country: kit.country,
          committee: kit.committee,
          committeeDescription: kit.committeeDescription,
          topic: kit.topic,
          roster: kit.roster,
          notes: kit.notes,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(await getActionError(response, "analyze the agenda stance"));
      }
      setStance(await response.json());
    } catch (err) {
      setError(err instanceof DOMException && err.name === "AbortError" ? undefined : err instanceof Error ? err.message : getNetworkError(err, "analyze the agenda stance"));
    } finally {
      setBusy(undefined);
    }
  }

  const retry = lastAction === "intel" ? runIntel : lastAction === "stance" ? runStance : lastAction === "news" ? runNews : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <ResearchLibrary />
      <section className="glass-strong rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Portfolio intelligence</h2>
          <Button onClick={runIntel} disabled={!kit || busy === "intel"}>
            {busy === "intel" ? <RefreshCw size={16} className="animate-spin" /> : <Brain size={16} />}
            {busy === "intel" ? "Generating brief" : "Generate brief"}
          </Button>
        </div>
        <ActionProgress active={busy === "intel"} label="Generating portfolio intelligence" onCancel={cancelRequest} />
        {lastAction === "intel" ? <ErrorNotice message={error} onRetry={retry} /> : null}
        <p className="mt-4 text-sm leading-6 text-muted">{intel?.summary ?? "Generate a local intelligence brief for this portfolio and agenda."}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["priorities", "redLines", "allies", "risks"] as const).map((key) => (
            <div key={key} className={`surface-tile rounded-lg p-4 ${intel ? "ai-surface" : ""}`}>
              <h3 className="text-sm font-semibold capitalize text-[var(--accent)]">{key}</h3>
              {(intel?.[key] ?? []).length ? <ul className="mt-3 grid gap-2 text-sm text-muted">
                {(intel?.[key] ?? []).map((item) => <li key={item}>{item}</li>)}
              </ul> : <p className="mt-3 text-sm text-soft">Generated findings will appear here</p>}
            </div>
          ))}
        </div>
        {intel ? <AiFeedback label="Portfolio intelligence" /> : null}
      </section>

      <section className="glass-strong rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Agenda stance</h2>
            <p className="mt-1 text-sm text-soft">Support, oppose, neutral, or mixed, with laws and policy context.</p>
          </div>
          <Button variant="secondary" onClick={runStance} disabled={!kit || busy === "stance"}>
            {busy === "stance" ? <RefreshCw size={16} className="animate-spin" /> : <Gavel size={16} />}
            {busy === "stance" ? "Analyzing stance" : "Analyze stance"}
          </Button>
        </div>
        <ActionProgress active={busy === "stance"} label="Analyzing agenda stance" onCancel={cancelRequest} />
        {lastAction === "stance" ? <ErrorNotice message={error} onRetry={retry} /> : null}
        {stance ? (
          <div className="ai-surface mt-5 grid gap-4 rounded-lg pl-4">
            <div className="surface-tile rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--foreground)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--background)]">
                  {stance.stance}
                </span>
                <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-muted">
                  {stance.confidence}% confidence
                </span>
                {stance.provider ? (
                  <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-soft">
                    {stance.provider}
                  </span>
                ) : null}
                <p className="text-sm leading-6 text-muted">{stance.summary}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-tile rounded-lg p-4">
                <h3 className="text-sm font-semibold text-ink">Reasoning</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {stance.reasoning.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="surface-tile rounded-lg p-4">
                <h3 className="text-sm font-semibold text-ink">Likely arguments</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {stance.likelyArguments.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-tile rounded-lg p-4">
                <h3 className="text-sm font-semibold text-ink">Detected issues</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {stance.detectedIssues.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="surface-tile rounded-lg p-4">
                <h3 className="text-sm font-semibold text-ink">Suggested improvements</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {stance.suggestedImprovements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="surface-tile rounded-lg p-4">
              <h3 className="text-sm font-semibold text-ink">Implemented laws, policies, or precedents</h3>
              <div className="mt-3 grid gap-3">
                {stance.lawsAndPolicies.map((law) => (
                  <article key={`${law.name}-${law.relevance}`} className="border-l border-[var(--line)] pl-3">
                    <p className="text-sm font-semibold text-ink">{law.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{law.relevance}</p>
                  </article>
                ))}
              </div>
            </div>
            {stance.cautions.length ? (
              <div className="surface-tile rounded-lg p-4">
                <h3 className="text-sm font-semibold text-ink">Cautions</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {stance.cautions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
            <AiFeedback label="Agenda stance" />
          </div>
        ) : (
          <div className="mt-4"><EmptyState title="No stance analysis yet" description="Generate a portfolio-specific position with confidence, policy context, and likely arguments." action={<Button variant="secondary" onClick={runStance} disabled={!kit || Boolean(busy)}>Analyze stance</Button>} /></div>
        )}
      </section>

      <section className="grid gap-5">
        <div className="glass-strong rounded-lg p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">News digest</h2>
            <Button variant="secondary" onClick={runNews} disabled={!kit || busy === "news"}>
              {busy === "news" ? <RefreshCw size={16} className="animate-spin" /> : <Newspaper size={16} />}
              {busy === "news" ? "Refreshing digest" : "Refresh digest"}
            </Button>
          </div>
          <ActionProgress active={busy === "news"} label="Refreshing the news digest" onCancel={cancelRequest} />
          {lastAction === "news" ? <ErrorNotice message={error} onRetry={retry} /> : null}
          <div className="mt-4 grid gap-3">
            {news?.items?.length ? (
              news.items.map((item) => (
                <article key={item.title} className="surface-tile ai-surface rounded-lg p-3">
                  <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-soft">{item.source}</p>
                  <p className="mt-2 text-sm leading-5 text-muted">{item.summary}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No news digest yet" description="Build a focused briefing from the current portfolio and agenda." action={<Button variant="secondary" onClick={runNews} disabled={!kit || Boolean(busy)}>Generate news digest</Button>} />
            )}
          </div>
          {news?.items?.length ? <AiFeedback label="News digest" /> : null}
        </div>
        <SpeechGenerator />
        <div className="glass-strong flex flex-wrap items-center justify-between gap-3 rounded-lg p-5">
          <DriveConnectButton />
          <ExportPdfButton />
        </div>
      </section>
    </div>
  );
}
