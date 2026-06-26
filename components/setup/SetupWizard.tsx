"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useState } from "react";
import { CommitteePicker } from "./CommitteePicker";
import { CountryAutocomplete } from "./CountryAutocomplete";
import { CountryRosterInput } from "./CountryRosterInput";
import { TopicInput } from "./TopicInput";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function SetupWizard() {
  const router = useRouter();
  const draft = useDelegateStore((state) => state.draft);
  const setDraft = useDelegateStore((state) => state.setDraft);
  const [saving, setSaving] = useState(false);
  const isCustomCommittee = draft.committee === "custom";
  const committeeReady = !isCustomCommittee || (draft.customCommitteeName.trim() && draft.customCommitteeDescription.trim());

  async function saveKit() {
    setSaving(true);
    const committee = isCustomCommittee ? draft.customCommitteeName.trim() : draft.committee;
    const committeeDescription = isCustomCommittee ? draft.customCommitteeDescription.trim() : undefined;
    const response = await fetch("/api/kits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, committee, committeeDescription }),
    });
    const data = await response.json();
    setSaving(false);
    router.push(`/workspace?kit=${data.kit.id}`);
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
      </section>

      <section className="glass-strong grid gap-5 rounded-lg p-5">
        <Field label="MUN name">
          <input className={inputClass} value={draft.name} onChange={(event) => setDraft({ name: event.target.value })} />
        </Field>
        <Field label="Portfolio">
          <CountryAutocomplete value={draft.country} onChange={(country) => setDraft({ country })} />
        </Field>
        <Field label="Committee">
          <CommitteePicker
            value={draft.committee}
            onChange={(committee) => setDraft({ committee })}
            customName={draft.customCommitteeName}
            customDescription={draft.customCommitteeDescription}
            onCustomNameChange={(customCommitteeName) => setDraft({ customCommitteeName })}
            onCustomDescriptionChange={(customCommitteeDescription) => setDraft({ customCommitteeDescription })}
          />
        </Field>
        <Field label="Agenda">
          <TopicInput value={draft.topic} onChange={(topic) => setDraft({ topic })} />
        </Field>
        <Field label="Portfolio roster">
          <CountryRosterInput roster={draft.roster} onChange={(roster) => setDraft({ roster })} />
        </Field>
        <div>
          <Button onClick={saveKit} disabled={saving || !draft.country || !draft.topic || !committeeReady}>
            <Save size={16} />
            {saving ? "Saving..." : "Create workspace"}
          </Button>
        </div>
      </section>
    </main>
  );
}
