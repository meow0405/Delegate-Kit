"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Columns3, LayoutDashboard, Network } from "lucide-react";

const tabs = [
  { href: "/workspace", label: "Overview", icon: LayoutDashboard },
  { href: "/workspace/matrix", label: "Matrix", icon: Columns3 },
  { href: "/workspace/blocs", label: "Blocs", icon: Network },
];

export function WorkspaceTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const kit = params.get("kit");

  return (
    <nav className="relative z-20 flex flex-wrap gap-2" aria-label="Workspace views">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
        const href = `${tab.href}${kit ? `?kit=${kit}` : ""}`;
        return (
          <button
            key={tab.href}
            type="button"
            onClick={() => router.push(href)}
            aria-current={active ? "page" : undefined}
            className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-gradient-to-r from-pink-400 to-cyan-300 text-slate-950" : "brand-badge hover:-translate-y-0.5"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
