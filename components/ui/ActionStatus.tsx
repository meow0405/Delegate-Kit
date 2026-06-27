"use client";

import { AlertCircle, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function useActionProgress(active: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;

    const startedAt = Date.now();
    const reset = window.setTimeout(() => setElapsed(0), 0);
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => {
      window.clearTimeout(reset);
      window.clearInterval(timer);
    };
  }, [active]);

  return elapsed;
}

export function ActionProgress({ active, label, onCancel }: { active: boolean; label: string; onCancel?: () => void }) {
  const elapsed = useActionProgress(active);
  if (!active || elapsed < 1000) return null;

  return (
    <div className="action-status" role="status" aria-live="polite">
      <LoaderCircle size={16} className="shrink-0 animate-spin" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {elapsed >= 3000 ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]" aria-label="Still working">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--foreground)]" />
          </div>
        ) : null}
        {elapsed >= 5000 ? <p className="mt-2 text-xs text-soft">This can take up to a minute with a local model</p> : null}
      </div>
      {onCancel ? (
        <button type="button" className="icon-button" onClick={onCancel} aria-label={`Cancel ${label.toLowerCase()}`} title="Cancel this request">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6">{message}</p>
        {onRetry ? <button type="button" className="mt-2 text-sm font-semibold underline underline-offset-4" onClick={onRetry}>Try again</button> : null}
      </div>
    </div>
  );
}
