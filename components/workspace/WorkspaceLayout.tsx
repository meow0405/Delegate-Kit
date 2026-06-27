"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EmptyState } from "@/components/ui/EmptyState";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const kitId = params.get("kit");
  const activeKit = useDelegateStore((state) => state.activeKit);
  const setActiveKit = useDelegateStore((state) => state.setActiveKit);
  const [loadError, setLoadError] = useState<{ kitId: string; message: string }>();
  const loading = Boolean(kitId && activeKit?.id !== kitId);
  const currentError = kitId && loadError?.kitId === kitId ? loadError.message : undefined;

  useEffect(() => {
    if (!kitId) return;
    fetch(`/api/kits/${kitId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This workspace is unavailable. It may have been deleted or moved.");
        return response.json();
      })
      .then((data) => setActiveKit(data.kit))
      .catch((caught) => {
        setActiveKit(undefined);
        setLoadError({ kitId, message: caught instanceof Error ? caught.message : "This workspace could not be opened." });
      });
  }, [kitId, setActiveKit]);

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="app-header flex flex-wrap items-center justify-between gap-3">
        <BrandMark compact />
        <ThemeToggle />
      </header>
      <section className="glass brand-panel rounded-lg p-5">
        <div className="relative z-20 mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-bold text-muted hover:bg-white/10">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <WorkspaceTabs />
        </div>
        <h1 className="text-3xl font-semibold text-ink">{currentError ? "Workspace unavailable" : loading ? "Opening workspace" : activeKit?.name ?? "Workspace"}</h1>
        {activeKit ? (
          <p className="mt-2 text-sm text-muted">
            {activeKit.country} | {activeKit.committee} | {activeKit.topic}
          </p>
        ) : null}
      </section>
      {currentError ? (
        <EmptyState
          title="This workspace could not be opened"
          description={`${currentError} Return to your saved kits and choose another workspace, or create a new one.`}
          action={<Link href="/dashboard" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)]">Return to saved kits</Link>}
        />
      ) : loading ? (
        <div className="grid gap-5 lg:grid-cols-2" role="status" aria-label="Opening workspace">
          <div className="glass-strong h-72 animate-pulse rounded-lg" />
          <div className="glass-strong h-72 animate-pulse rounded-lg" />
        </div>
      ) : children}
    </main>
  );
}
