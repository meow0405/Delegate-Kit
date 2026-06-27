"use client";

import { Download, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ActionProgress, ErrorNotice } from "@/components/ui/ActionStatus";
import { useDelegateStore } from "@/lib/store/delegateStore";
import { getActionError, getNetworkError } from "@/lib/ui/apiError";

export function ExportPdfButton() {
  const kit = useDelegateStore((state) => state.activeKit);
  const intel = useDelegateStore((state) => state.intel);
  const driveToken = useDelegateStore((state) => state.driveToken);
  const [lastExport, setLastExport] = useState<{ filename: string; path: string }>();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"export" | "upload">();
  const [error, setError] = useState<string>();

  async function exportPdf() {
    if (!kit) return;
    setBusy(true);
    setStatus("export");
    setError(undefined);
    try {
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
      if (!response.ok) throw new Error(await getActionError(response, "export the position paper"));
      const data = await response.json();
      if (!data.path) throw new Error("The PDF was created without a download link. Try exporting it again.");
      setLastExport(data);
      window.open(data.path, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "export the position paper"));
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!driveToken || !lastExport) return;
    setBusy(true);
    setStatus("upload");
    setError(undefined);
    try {
      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: driveToken, filename: lastExport.filename }),
      });
      if (!response.ok) throw new Error(await getActionError(response, "upload the PDF to Drive"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : getNetworkError(caught, "upload the PDF to Drive"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
      <Button onClick={exportPdf} disabled={!kit || busy} aria-busy={busy && status === "export"}>
        <Download size={16} />
        {busy && status === "export" ? "Creating PDF" : "Export PDF"}
      </Button>
      <Button variant="secondary" onClick={upload} disabled={!driveToken || !lastExport || busy} aria-busy={busy && status === "upload"}>
        <UploadCloud size={16} />
        {busy && status === "upload" ? "Uploading to Drive" : "Upload to Drive"}
      </Button>
      </div>
      <ActionProgress active={busy} label={status === "upload" ? "Uploading the PDF to Drive" : "Creating the position paper PDF"} />
      <ErrorNotice message={error} onRetry={status === "upload" ? upload : exportPdf} />
    </div>
  );
}
