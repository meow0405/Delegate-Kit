import { FolderOpen, Gavel, Landmark } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-badge inline-flex items-center gap-3 rounded-lg px-3 py-2.5">
      <div className="grid size-10 place-items-center rounded-lg bg-[var(--foreground)] text-[var(--background)] shadow-sm">
        {compact ? <FolderOpen size={22} /> : <Gavel size={22} />}
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em]">Delegate Kit</p>
        <p className="mt-0.5 text-xs text-muted">MUN command folder</p>
      </div>
    </div>
  );
}

export function MunGlyph({ size = 130 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-white/14 blur-md" />
      <Landmark className="relative" size={size * 0.54} strokeWidth={1.25} />
      <Gavel className="absolute bottom-[16%] right-[12%] rotate-[-18deg]" size={size * 0.31} strokeWidth={1.6} />
      <FolderOpen className="absolute left-[12%] top-[17%]" size={size * 0.28} strokeWidth={1.6} />
    </div>
  );
}
