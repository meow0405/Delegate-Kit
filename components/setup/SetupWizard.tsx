"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CommitteePicker } from "./CommitteePicker";
import { CountryAutocomplete } from "./CountryAutocomplete";
import { CountryRosterInput } from "./CountryRosterInput";
import { TopicInput } from "./TopicInput";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function SetupWizard() {
  const router = useRouter();
  const draft = useDelegateStore((state) => state.draft);
  const setDraft = useDelegateStore((state) => state.setDraft);
  const resetDraft = useDelegateStore((state) => state.resetDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const isCustomCommittee = draft.committee === "custom";
  const committeeReady = Boolean(draft.committee) && (!isCustomCommittee || Boolean(draft.customCommitteeName.trim() && draft.customCommitteeDescription.trim()));

  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  function validateField(field: "name" | "country" | "committee" | "topic") {
    const message = field === "name" && !draft.name.trim()
      ? "Add the conference or simulation name"
      : field === "country" && !draft.country.trim()
        ? "Choose or enter the portfolio you represent"
        : field === "committee" && !committeeReady
          ? isCustomCommittee ? "Add both a custom committee name and explanation" : "Choose the committee you are simulating"
          : field === "topic" && !draft.topic.trim()
            ? "Add the exact agenda being debated"
            : "";
    setFieldErrors((current) => ({ ...current, [field]: message }));
    return !message;
  }

  function focusField(field: string) {
    if (field === "name") nameRef.current?.focus();
    else document.getElementById(field === "country" ? "portfolio" : field)?.focus();
  }

  function validateStep(targetStep = step) {
    const fields = targetStep === 1 ? (["name", "country", "committee"] as const) : (["topic"] as const);
    const results = fields.map((field) => [field, validateField(field)] as const);
    const firstInvalid = results.find(([, valid]) => !valid)?.[0];
    if (firstInvalid) window.setTimeout(() => focusField(firstInvalid), 0);
    return !firstInvalid;
  }

  function continueSetup() {
    if (!validateStep()) return;
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveKit() {
    const validIdentity = validateStep(1);
    const validAgenda = validateStep(2);
    if (!validIdentity || !validAgenda) {
      setStep(validIdentity ? 2 : 1);
      return;
    }
    setSaving(true);
    setError(undefined);
    const committee = isCustomCommittee ? draft.customCommitteeName.trim() : draft.committee;
    const committeeDescription = isCustomCommittee ? draft.customCommitteeDescription.trim() : undefined;
    try {
      const response = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, committee, committeeDescription }),
      });
      if (!response.ok) throw new Error(await getActionError(response, "create the workspace"));
      const data = await response.json();
      if (!data.kit?.id) throw new Error("The workspace was not saved correctly. Review the details and try again.");
      router.push(`/workspace?kit=${data.kit.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "create the workspace"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="app-header flex flex-wrap items-center justify-between gap-3">
        <BrandMark compact />
        <ThemeToggle />
      </header>
      <section className="glass brand-panel rounded-lg p-5">
        <p className="eyebrow text-muted">Build your placard folder</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Kit setup</h1>
        <p className="mt-2 text-sm text-muted">Choose the core simulation inputs. The rest of the workspace builds from this local record.</p>
        <div className="relative z-10 mt-5" aria-label={`Step ${step} of 3`}>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-muted">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? "Simulation" : step === 2 ? "Agenda and roster" : "Review"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full rounded-full bg-[var(--foreground)] transition-[width]" style={{ width: `${(step / 3) * 100}%` }} /></div>
        </div>
      </section>

      <section className="glass-strong grid gap-5 rounded-lg p-5" aria-live="polite">
        {Object.values(fieldErrors).some(Boolean) ? <div className="error-notice" role="alert"><div><p className="text-sm font-semibold">Review the highlighted fields</p><div className="mt-2 flex flex-wrap gap-3">{Object.entries(fieldErrors).filter(([, message]) => message).map(([field, message]) => <button key={field} type="button" className="text-left text-xs underline underline-offset-4" onClick={() => focusField(field)}>{message}</button>)}</div></div></div> : null}
        {step === 1 ? <>
        <Field htmlFor="mun-name" label="MUN name" description="Use the conference or simulation name you will recognize later" required error={fieldErrors.name}>
          <input ref={nameRef} id="mun-name" className={inputClass} value={draft.name} onChange={(event) => setDraft({ name: event.target.value })} onBlur={() => validateField("name")} placeholder="Harvard WorldMUN 2026" autoComplete="organization" aria-invalid={Boolean(fieldErrors.name)} required />
        </Field>
        <Field htmlFor="portfolio" label="Portfolio" description="Choose a country, territory, party, or public figure, or enter a custom portfolio" required error={fieldErrors.country}>
          <CountryAutocomplete id="portfolio" value={draft.country} onChange={(country) => setDraft({ country })} onBlur={() => validateField("country")} invalid={Boolean(fieldErrors.country)} />
        </Field>
        <Field label="Committee" description="Select the body whose mandate and procedure shape your strategy" required error={fieldErrors.committee}>
          <div id="committee" tabIndex={-1}>
          <CommitteePicker
            value={draft.committee}
            onChange={(committee) => setDraft({ committee })}
            customName={draft.customCommitteeName}
            customDescription={draft.customCommitteeDescription}
            onCustomNameChange={(customCommitteeName) => setDraft({ customCommitteeName })}
            onCustomDescriptionChange={(customCommitteeDescription) => setDraft({ customCommitteeDescription })}
          />
          </div>
        </Field>
        </> : null}
        {step === 2 ? <>
        <Field htmlFor="topic" label="Agenda" description="Enter the exact issue being debated" required error={fieldErrors.topic}>
          <TopicInput id="topic" value={draft.topic} onChange={(topic) => setDraft({ topic })} onBlur={() => validateField("topic")} invalid={Boolean(fieldErrors.topic)} />
        </Field>
        <Field htmlFor="roster" label="Portfolio roster" description="Optional. Add the portfolios you expect to negotiate with; you can edit this later">
          <CountryRosterInput id="roster" roster={draft.roster} onChange={(roster) => setDraft({ roster })} />
        </Field>
        </> : null}
        {step === 3 ? <div className="grid gap-4">
          <div><p className="eyebrow text-soft">Review your workspace</p><h2 className="mt-2 text-2xl font-semibold text-ink">Ready to create</h2><p className="mt-2 text-sm leading-6 text-muted">Check these details. You can go back without losing anything.</p></div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[{ label: "MUN name", value: draft.name }, { label: "Portfolio", value: draft.country }, { label: "Committee", value: isCustomCommittee ? draft.customCommitteeName : draft.committee }, { label: "Agenda", value: draft.topic }, { label: "Roster", value: `${draft.roster.length} portfolios` }].map((item) => <div key={item.label} className="surface-tile min-w-0 rounded-lg p-4"><dt className="text-xs font-semibold uppercase text-soft">{item.label}</dt><dd className="mt-2 break-words text-sm font-semibold leading-6 text-ink">{item.value}</dd></div>)}
          </dl>
        </div> : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
          {step > 1 ? <Button variant="secondary" onClick={() => setStep((current) => current - 1)} disabled={saving}><ArrowLeft size={16} />Back</Button> : <span />}
          {step < 3 ? <Button onClick={continueSetup}>{step === 1 ? "Continue to agenda" : "Review workspace"}<ArrowRight size={16} /></Button> : <div>
          <Button onClick={saveKit} disabled={saving || !draft.name.trim() || !draft.country || !draft.topic || !committeeReady} aria-busy={saving}>
            {saving ? <Save size={16} /> : <Check size={16} />}
            {saving ? "Creating workspace" : "Create workspace"}
          </Button>
          <ActionProgress active={saving} label="Creating your workspace" />
          <ErrorNotice message={error} onRetry={saveKit} />
          </div>}
        </div>
      </section>
    </main>
  );
}
