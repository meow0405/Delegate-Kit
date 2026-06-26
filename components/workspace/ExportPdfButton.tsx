"use client";

import { Download, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDelegateStore } from "@/lib/store/delegateStore";

export function ExportPdfButton() {
  const kit = useDelegateStore((state) => state.activeKit);
  const intel = useDelegateStore((state) => state.intel);
  const driveToken = useDelegateStore((state) => state.driveToken);
  const [lastExport, setLastExport] = useState<{ filename: string; path: string }>();
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    if (!kit) return;
    setBusy(true);
    const response = await fetch("/api/export/position-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kitId: kit.id,
        country: kit.country,
        committee: kit.committee,
        topic: kit.topic,
        background: intel?.summary ?? `Background on ${kit.topic}.`,
        position: (intel?.priorities ?? []).join("; ") || `${kit.country} supports practical committee action.`,
        solutions: (intel?.risks ?? []).map((risk) => `Address ${risk}`).join("; ") || "Build consensus around measurable implementation.",
      }),
    });
    const data = await response.json();
    setLastExport(data);
    setBusy(false);
    window.open(data.path, "_blank", "noopener,noreferrer");
  }

  async function upload() {
    if (!driveToken || !lastExport) return;
    setBusy(true);
    await fetch("/api/drive/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: driveToken, filename: lastExport.filename }),
    });
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportPdf} disabled={!kit || busy}>
        <Download size={16} />
        Export PDF
      </Button>
      <Button variant="secondary" onClick={upload} disabled={!driveToken || !lastExport || busy}>
        <UploadCloud size={16} />
        Upload to Drive
      </Button>
    </div>
  );
}
