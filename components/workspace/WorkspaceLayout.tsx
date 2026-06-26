"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const kitId = params.get("kit");
  const activeKit = useDelegateStore((state) => state.activeKit);
  const setActiveKit = useDelegateStore((state) => state.setActiveKit);
  const loading = Boolean(kitId && activeKit?.id !== kitId);

  useEffect(() => {
    if (!kitId) return;
    fetch(`/api/kits/${kitId}`)
      .then((response) => response.json())
      .then((data) => setActiveKit(data.kit))
      .catch(() => setActiveKit(undefined));
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
        <h1 className="text-3xl font-semibold text-ink">{loading ? "Loading workspace..." : activeKit?.name ?? "Workspace"}</h1>
        {activeKit ? (
          <p className="mt-2 text-sm text-muted">
            {activeKit.country} | {activeKit.committee} | {activeKit.topic}
          </p>
        ) : null}
      </section>
      {children}
    </main>
  );
}
