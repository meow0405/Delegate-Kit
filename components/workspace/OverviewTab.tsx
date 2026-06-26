"use client";

import { Brain, Gavel, Newspaper, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { SpeechGenerator } from "./SpeechGenerator";
import { ExportPdfButton } from "./ExportPdfButton";
import { DriveConnectButton } from "@/components/ui/DriveConnectButton";

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

  async function runIntel() {
    if (!kit) return;
    setBusy("intel");
    setError(undefined);
    try {
      const response = await fetch("/api/ai/country-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitId: kit.id, country: kit.country, committee: kit.committee, topic: kit.topic }),
      });

      if (!response.ok) throw new Error("Portfolio intelligence route failed.");
      setIntel(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate portfolio intelligence.");
    } finally {
      setBusy(undefined);
    }
  }

  async function runNews() {
    if (!kit) return;
    setBusy("news");
    setError(undefined);
    try {
      const response = await fetch("/api/ai/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${kit.topic} ${kit.country}` }),
      });

      if (!response.ok) throw new Error("News digest route failed.");
      setNews(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh news digest.");
    } finally {
      setBusy(undefined);
    }
  }

  async function runStance() {
    if (!kit) return;
    setBusy("stance");
    setError(undefined);
    try {
      const response = await fetch("/api/ai/stance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: kit.country,
          committee: kit.committee,
          committeeDescription: kit.committeeDescription,
          topic: kit.topic,
          roster: kit.roster,
          notes: kit.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Stance analysis route failed.");
      }
      setStance(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze stance.");
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-strong rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Portfolio intelligence</h2>
          <Button onClick={runIntel} disabled={!kit || busy === "intel"}>
            {busy === "intel" ? <RefreshCw size={16} className="animate-spin" /> : <Brain size={16} />}
            Generate
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
        <p className="mt-4 text-sm leading-6 text-muted">{intel?.summary ?? "Generate a local intelligence brief for this portfolio and agenda."}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["priorities", "redLines", "allies", "risks"] as const).map((key) => (
            <div key={key} className="surface-tile rounded-lg p-4">
              <h3 className="text-sm font-semibold capitalize text-[var(--accent)]">{key}</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {(intel?.[key] ?? []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-strong rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Agenda stance</h2>
            <p className="mt-1 text-sm text-soft">Support, oppose, neutral, or mixed, with laws and policy context.</p>
          </div>
          <Button variant="secondary" onClick={runStance} disabled={!kit || busy === "stance"}>
            {busy === "stance" ? <RefreshCw size={16} className="animate-spin" /> : <Gavel size={16} />}
            Analyze stance
          </Button>
        </div>
        {stance ? (
          <div className="mt-5 grid gap-4">
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
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            Analyze the portfolio&apos;s position on the agenda, including whether it supports, opposes, or takes a neutral or mixed stance.
          </p>
        )}
      </section>

      <section className="grid gap-5">
        <div className="glass-strong rounded-lg p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">News digest</h2>
            <Button variant="secondary" onClick={runNews} disabled={!kit || busy === "news"}>
              {busy === "news" ? <RefreshCw size={16} className="animate-spin" /> : <Newspaper size={16} />}
              Refresh
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {news?.items?.length ? (
              news.items.map((item) => (
                <article key={item.title} className="surface-tile rounded-lg p-3">
                  <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-soft">{item.source}</p>
                  <p className="mt-2 text-sm leading-5 text-muted">{item.summary}</p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">Refresh to generate a research digest for this portfolio and agenda.</p>
            )}
          </div>
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
