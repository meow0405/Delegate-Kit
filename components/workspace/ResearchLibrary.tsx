"use client";

import { FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";
import { useDelegateStore } from "@/lib/store/delegateStore";

type ResearchSource = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResearchLibrary() {
  const kit = useDelegateStore((state) => state.activeKit);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const loadSources = useCallback(async () => {
    if (!kit) return;
    try {
      const response = await fetch(`/api/kits/${kit.id}/sources`);
      if (!response.ok) throw new Error(await getActionError(response, "load research sources"));
      const data = await response.json();
      setSources(data.sources ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "load research sources"));
    }
  }, [kit]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSources(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSources]);

  async function uploadFiles(files: FileList | null) {
    if (!kit || !files?.length) return;
    setBusy(true);
    setError(undefined);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch(`/api/kits/${kit.id}/sources`, { method: "POST", body: form });
        if (!response.ok) throw new Error(await getActionError(response, `import ${file.name}`));
        const data = await response.json();
        setSources((current) => [data.source, ...current.filter((source) => source.id !== data.source.id)]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "import the research file"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeSource(source: ResearchSource) {
    if (!kit || !window.confirm(`Remove "${source.filename}" from this kit's research library?`)) return;
    const response = await fetch(`/api/kits/${kit.id}/sources/${source.id}`, { method: "DELETE" });
    if (response.ok) setSources((current) => current.filter((item) => item.id !== source.id));
    else setError(await getActionError(response, "remove the research source"));
  }

  return (
    <section className="glass-strong rounded-lg p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-soft">Grounding sources</p>
          <h2 className="mt-1 text-lg font-bold text-ink">Research library</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Imported text is stored locally with this kit and automatically used for speeches, stance, committee context, portfolio intelligence, relations, blocs, and source lists.</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={!kit || busy}>
          {busy ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
          {busy ? "Importing research" : "Import research files"}
        </Button>
        <input ref={inputRef} className="sr-only" type="file" multiple accept=".pdf,.txt,.md,.markdown,.csv,.json,.html,.htm,application/pdf,text/plain,text/markdown,text/csv,application/json,text/html" onChange={(event) => void uploadFiles(event.target.files)} />
      </div>
      <ActionProgress active={busy} label="Extracting text and adding research" />
      <ErrorNotice message={error} onRetry={loadSources} />
      {sources.length ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => (
            <article key={source.id} className="surface-tile flex min-w-0 items-start gap-3 rounded-lg p-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--foreground)] text-[var(--background)]"><FileText size={18} /></div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-ink" title={source.filename}>{source.filename}</h3>
                <p className="mt-1 text-xs text-soft">{formatBytes(source.sizeBytes)} | Imported {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(source.createdAt))}</p>
              </div>
              <button type="button" className="icon-button shrink-0 text-rose-500" onClick={() => void removeSource(source)} aria-label={`Remove ${source.filename}`} title="Remove this source"><Trash2 size={16} /></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5"><EmptyState title="No research sources yet" description="Import a PDF or text-based research file to ground every AI tool in your own material." action={<Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={!kit || busy}><Upload size={16} />Choose research files</Button>} /></div>
      )}
    </section>
  );
}
