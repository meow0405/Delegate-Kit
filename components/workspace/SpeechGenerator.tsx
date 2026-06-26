"use client";

import { Copy, Edit3, Mic2, RefreshCw, RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { useDelegateStore } from "@/lib/store/delegateStore";
import type { SpeechDraft } from "@/lib/ai/schemas";

type SpeechMode = "gsl" | "mod";
type SpeechStyle = "formal" | "dramatic" | "poetic" | "diplomatic" | "assertive";

const speechStyles: Array<{ value: SpeechStyle; label: string }> = [
  { value: "formal", label: "Formal" },
  { value: "dramatic", label: "Dramatic" },
  { value: "poetic", label: "Poetic" },
  { value: "diplomatic", label: "Diplomatic" },
  { value: "assertive", label: "Assertive" },
];

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(value?: string) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function estimateSeconds(body: string) {
  return Math.max(5, Math.round((countWords(body) / 150) * 60));
}

export function SpeechGenerator() {
  const kit = useDelegateStore((state) => state.activeKit);
  const speech = useDelegateStore((state) => state.speech);
  const stance = useDelegateStore((state) => state.stance);
  const setSpeech = useDelegateStore((state) => state.setSpeech);
  const addSavedSpeech = useDelegateStore((state) => state.addSavedSpeech);
  const updateSavedSpeech = useDelegateStore((state) => state.updateSavedSpeech);
  const deleteSavedSpeech = useDelegateStore((state) => state.deleteSavedSpeech);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<SpeechMode>("gsl");
  const [style, setStyle] = useState<SpeechStyle>("formal");
  const [seconds, setSeconds] = useState(60);
  const [modTopic, setModTopic] = useState("");
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const savedSpeeches = useMemo(() => kit?.speeches ?? [], [kit?.speeches]);

  async function generate(overrides?: Partial<{ mode: SpeechMode; style: SpeechStyle; seconds: number; modTopic: string }>) {
    if (!kit) return;
    const nextMode = overrides?.mode ?? mode;
    const nextStyle = overrides?.style ?? style;
    const nextSeconds = overrides?.seconds ?? seconds;
    const nextModTopic = overrides?.modTopic ?? modTopic;

    if (nextMode === "mod" && !nextModTopic.trim()) {
      setError("Add the moderated caucus topic first.");
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      const response = await fetch("/api/ai/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId: kit.id,
          country: kit.country,
          committee: kit.committee,
          topic: kit.topic,
          stance: stance
            ? `${stance.stance.toUpperCase()}: ${stance.summary} Likely arguments: ${stance.likelyArguments.join(" ")}`
            : undefined,
          type: nextMode,
          style: nextStyle,
          seconds: nextSeconds,
          modTopic: nextMode === "mod" ? nextModTopic : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Speech route failed.");
      }

      const generated = await response.json();
      setSpeech(generated);
      addSavedSpeech(generated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate speech.");
    } finally {
      setBusy(false);
    }
  }

  function openSpeech(item: SpeechDraft) {
    setSpeech(item);
    setDraftTitle(item.title);
    setDraftBody(item.body);
    setEditing(false);
  }

  function beginEdit(item: SpeechDraft) {
    setSpeech(item);
    setDraftTitle(item.title);
    setDraftBody(item.body);
    setEditing(true);
  }

  async function saveEdit() {
    if (!speech?.id) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/speeches/${speech.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle, body: draftBody }),
      });

      if (!response.ok) throw new Error("Could not save speech edits.");
      const data = await response.json();
      setSpeech(data.speech);
      updateSavedSpeech(data.speech);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save speech edits.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSpeech(item: SpeechDraft) {
    if (!item.id) return;
    setError(undefined);
    try {
      const response = await fetch(`/api/speeches/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete saved speech.");
      deleteSavedSpeech(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete saved speech.");
    }
  }

  async function copySpeech(item = speech) {
    if (!item) return;
    await navigator.clipboard.writeText(item.body);
  }

  function regenerateFrom(item: SpeechDraft) {
    const nextMode = item.type === "mod" ? "mod" : "gsl";
    const nextStyle = (item.style as SpeechStyle | undefined) ?? style;
    const nextSeconds = item.seconds ?? seconds;
    setMode(nextMode);
    setStyle(nextStyle);
    setSeconds(nextSeconds);
    setModTopic(nextMode === "mod" ? item.focus ?? "" : "");
    void generate({ mode: nextMode, style: nextStyle, seconds: nextSeconds, modTopic: item.focus ?? "" });
  }

  const activeWordCount = speech ? countWords(speech.body) : 0;
  const activeEstimate = speech ? estimateSeconds(speech.body) : 0;
  const timingWarning =
    speech && speech.seconds && Math.abs(activeEstimate - speech.seconds) > 12
      ? `Estimated ${activeEstimate}s, target ${speech.seconds}s.`
      : undefined;

  return (
    <div className="glass-strong rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Speech generator</h2>
        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-soft">
          {savedSpeeches.length} saved
        </span>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              {(["gsl", "mod"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`focus-ring rounded-lg border px-3 py-2 text-sm font-semibold uppercase transition ${
                    mode === item ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]" : "surface-tile text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {mode === "mod" ? (
              <label className="grid gap-2 text-sm font-semibold text-muted">
                <span>Mod topic</span>
                <input
                  className={inputClass}
                  value={modTopic}
                  onChange={(event) => setModTopic(event.target.value)}
                  placeholder="e.g. Women's access to education under Sharia law"
                />
              </label>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold text-muted">
              <span>Speech style</span>
              <select className={inputClass} value={style} onChange={(event) => setStyle(event.target.value as SpeechStyle)}>
                {speechStyles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-muted">
              <span>Speaking time in seconds</span>
              <input
                className={inputClass}
                type="number"
                min={15}
                max={300}
                step={5}
                value={seconds}
                onChange={(event) => setSeconds(Number(event.target.value))}
              />
            </label>

            {error ? <p className="text-sm text-rose-500">{error}</p> : null}

            <Button variant="secondary" onClick={() => generate()} disabled={!kit || busy}>
              {busy ? <RefreshCw size={16} className="animate-spin" /> : <Mic2 size={16} />}
              Generate and save
            </Button>
          </div>

          <div className="surface-tile rounded-lg p-4">
            <h3 className="text-sm font-bold text-ink">Saved speeches</h3>
            {savedSpeeches.length ? (
              <div className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                {savedSpeeches.map((item) => (
                  <article key={item.id ?? item.title} className="rounded-md border border-[var(--line)] p-3">
                    <button type="button" className="block text-left text-sm font-bold text-ink" onClick={() => openSpeech(item)}>
                      {item.title}
                    </button>
                    <p className="mt-1 text-xs leading-5 text-soft">
                      {kit?.country} | {item.type ?? "speech"} | {item.style ?? "style"} | {item.seconds ?? estimateSeconds(item.body)}s
                    </p>
                    <p className="text-xs text-soft">{formatDate(item.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => void copySpeech(item)} aria-label="Copy speech">
                        <Copy size={15} />
                      </button>
                      <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => beginEdit(item)} aria-label="Edit speech">
                        <Edit3 size={15} />
                      </button>
                      <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => regenerateFrom(item)} aria-label="Regenerate speech">
                        <RotateCcw size={15} />
                      </button>
                      <button className="focus-ring rounded-md p-2 text-rose-500 hover:bg-white/10" onClick={() => void removeSpeech(item)} aria-label="Delete speech">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">No saved speeches yet. Every generated speech will appear here automatically.</p>
            )}
          </div>
        </div>

        <article className="surface-tile rounded-lg p-4">
          {speech ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {editing ? (
                    <input className={inputClass} value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
                  ) : (
                    <h3 className="text-sm font-bold text-ink">{speech.title}</h3>
                  )}
                  <p className="mt-2 text-xs text-soft">
                    {speech.type ?? mode} | {speech.style ?? style} | {speech.seconds ?? seconds}s target | {activeWordCount} words | est. {activeEstimate}s
                  </p>
                  {timingWarning ? <p className="mt-1 text-xs text-amber-500">{timingWarning}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => void copySpeech()} aria-label="Copy active speech">
                    <Copy size={16} />
                  </button>
                  {editing ? (
                    <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => void saveEdit()} aria-label="Save edits" disabled={saving}>
                      {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                  ) : (
                    <button className="focus-ring rounded-md p-2 text-ink hover:bg-white/10" onClick={() => beginEdit(speech)} aria-label="Edit active speech">
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {editing ? (
                <textarea className={`${inputClass} mt-4 min-h-80 w-full leading-6`} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} />
              ) : (
                <div className="mt-4 grid gap-3">
                  {speech.body.split(/\n{2,}/).map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    const isQuote = trimmed.startsWith('"') && trimmed.endsWith('"');

                    return isQuote ? (
                      <blockquote
                        key={`${trimmed}-${index}`}
                        className="border-l-2 border-[var(--accent)] bg-[var(--tile)] px-4 py-3 font-serif text-lg italic leading-7 text-ink"
                      >
                        {trimmed}
                      </blockquote>
                    ) : (
                      <p key={`${trimmed}-${index}`} className="text-sm leading-6 text-muted">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm leading-6 text-muted">Generate a speech or open one from the saved menu.</p>
          )}
        </article>
      </div>
    </div>
  );
}
