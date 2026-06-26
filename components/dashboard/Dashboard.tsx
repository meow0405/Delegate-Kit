"use client";

import Link from "next/link";
import { FileText, FolderOpen, Gavel, Landmark, Plus, Trash2, UsersRound } from "lucide-react";
import { useEffect } from "react";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { DriveConnectButton } from "@/components/ui/DriveConnectButton";
import { Button } from "@/components/ui/Button";
import { BrandMark, MunGlyph } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Dashboard() {
  const kits = useDelegateStore((state) => state.kits);
  const setKits = useDelegateStore((state) => state.setKits);

  async function deleteKit(kitId: string, kitName: string) {
    const confirmed = window.confirm(`Delete "${kitName}"? This removes the kit and its saved workspace data.`);
    if (!confirmed) return;

    const response = await fetch(`/api/kits/${kitId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setKits(kits.filter((kit) => kit.id !== kitId));
    }
  }

  useEffect(() => {
    fetch("/api/kits")
      .then((response) => response.json())
      .then((data) => setKits(data.kits ?? []))
      .catch(() => setKits([]));
  }, [setKits]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="app-header flex flex-wrap items-center justify-between gap-3">
        <BrandMark />
        <ThemeToggle />
      </header>

      <section className="glass brand-panel hero-panel grid gap-8 rounded-lg p-5 md:grid-cols-[0.84fr_1.16fr] md:items-stretch lg:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-12 py-3">
          <div className="space-y-8">
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              <p className="eyebrow text-muted">Delegate_Kit / Local_Dossier</p>
              <p className="eyebrow text-soft">2026</p>
            </div>
            <div className="space-y-6">
              <h1 className="hero-title max-w-3xl text-ink">
                Delegate<br />
                <span className="gradient-text">Kit</span>
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-soft">
                Research / Blocs / Speeches / Papers
              </p>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">
              A polished local workspace for country research, bloc strategy, speeches, and position papers.
            </p>
          </div>

          <div className="space-y-7">
            <div className="grid max-w-lg grid-cols-3 gap-4">
              <div className="hero-stat pt-3">
                <p className="text-2xl font-semibold text-ink">01</p>
                <p className="mt-1 text-xs">workspace</p>
              </div>
              <div className="hero-stat pt-3">
                <p className="text-2xl font-semibold text-ink">AI</p>
                <p className="mt-1 text-xs">local first</p>
              </div>
              <div className="hero-stat pt-3">
                <p className="text-2xl font-semibold text-ink">PDF</p>
                <p className="mt-1 text-xs">export ready</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/kit/setup">
                <Button className="w-full sm:w-auto">
                  <Plus size={16} />
                  New kit
                </Button>
              </Link>
              <DriveConnectButton />
            </div>
          </div>
        </div>

        <div className="editorial-frame relative z-10 rounded-lg" aria-hidden="true">
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-soft">Saved work</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Your kits</h2>
          </div>
        </div>
        {kits.length === 0 ? (
          <div className="glass-strong kit-card max-w-xl rounded-lg p-5 pl-7">
            <p className="text-sm text-muted">No kits yet. Start with the setup wizard and your first kit will be saved locally.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {kits.map((kit) => (
              <Link key={kit.id} href={`/workspace?kit=${kit.id}`} className="glass-strong kit-card group rounded-lg p-5 pl-7 transition hover:-translate-y-0.5 hover:border-pink-300/60">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-pink-400/20 via-cyan-300/20 to-yellow-200/25 text-[var(--accent)]">
                    <FileText size={21} />
                  </div>
                  <button
                    type="button"
                    className="focus-ring relative z-10 rounded-md p-2 text-soft transition hover:bg-[var(--tile)] hover:text-rose-500"
                    aria-label={`Delete ${kit.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void deleteKit(kit.id, kit.name);
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold leading-snug text-ink group-hover:gradient-text">{kit.name}</h3>
                <p className="mt-3 text-sm text-soft">{kit.country} in {kit.committee}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{kit.topic}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
