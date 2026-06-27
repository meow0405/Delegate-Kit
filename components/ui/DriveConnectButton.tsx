"use client";

import { CheckCircle2, Cloud, ExternalLink, X } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { useDelegateStore } from "@/lib/store/delegateStore";

const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const hasConfiguredClient = Boolean(configuredClientId && configuredClientId !== "YOUR_GOOGLE_OAUTH_CLIENT_ID");

export function DriveConnectButton() {
  const [setupOpen, setSetupOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [runtimeClientId, setRuntimeClientId] = useState("");

  useEffect(() => {
    const savedClientId = window.localStorage.getItem("delegate-kit-google-client-id");
    if (savedClientId) window.setTimeout(() => setRuntimeClientId(savedClientId), 0);
  }, []);

  if (hasConfiguredClient) return <ConfiguredDriveConnectButton />;

  if (runtimeClientId) {
    return (
      <GoogleOAuthProvider clientId={runtimeClientId}>
        <ConfiguredDriveConnectButton onConfigure={() => setSetupOpen(true)} />
        {setupOpen ? <DriveSetupDialog clientId={clientId || runtimeClientId} onClientIdChange={setClientId} onClose={() => setSetupOpen(false)} onSave={(value) => {
          window.localStorage.setItem("delegate-kit-google-client-id", value);
          setRuntimeClientId(value);
          setSetupOpen(false);
        }} /> : null}
      </GoogleOAuthProvider>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setSetupOpen(true)}>
        <Cloud size={16} />
        Connect Google Drive
      </Button>
      {setupOpen ? <DriveSetupDialog clientId={clientId} onClientIdChange={setClientId} onClose={() => setSetupOpen(false)} onSave={(value) => {
        window.localStorage.setItem("delegate-kit-google-client-id", value);
        setRuntimeClientId(value);
        setSetupOpen(false);
      }} /> : null}
    </>
  );
}

function ConfiguredDriveConnectButton({ onConfigure }: { onConfigure?: () => void }) {
  const driveToken = useDelegateStore((state) => state.driveToken);
  const setDriveToken = useDelegateStore((state) => state.setDriveToken);
  const [error, setError] = useState<string>();
  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.file",
    onSuccess: (tokenResponse) => {
      setDriveToken(tokenResponse.access_token);
      setError(undefined);
    },
    onError: () => setError("Google Drive did not connect. Check the OAuth client and authorized origin, then try again."),
  });

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant={driveToken ? "secondary" : "primary"} onClick={() => login()}>
          {driveToken ? <CheckCircle2 size={16} /> : <Cloud size={16} />}
          {driveToken ? "Drive connected" : "Connect Google Drive"}
        </Button>
        {onConfigure ? <button type="button" className="feedback-button" onClick={onConfigure}>Drive settings</button> : null}
      </div>
      {error ? <p className="text-xs leading-5 text-rose-500" role="alert">{error}</p> : null}
    </div>
  );
}

function DriveSetupDialog({ clientId, onClientIdChange, onClose, onSave }: { clientId: string; onClientIdChange: (value: string) => void; onClose: () => void; onSave: (value: string) => void }) {
  const valid = clientId.trim().endsWith(".apps.googleusercontent.com");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="drive-setup-title" className="glass-strong w-full max-w-lg rounded-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="drive-setup-title" className="text-lg font-semibold text-ink">Connect Google Drive</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Delegate Kit requests access only to files it creates. Your OAuth client ID is public configuration and stays in this browser.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close Google Drive setup"><X size={17} /></button>
        </div>
        <ol className="mt-5 grid gap-2 text-sm leading-6 text-muted">
          <li>1. Create a Google OAuth web client</li>
          <li>2. Add <code className="rounded bg-[var(--tile)] px-1.5 py-0.5 text-xs text-ink">http://localhost:3000</code> as an authorized JavaScript origin</li>
          <li>3. Paste the client ID below, then continue to Google</li>
        </ol>
        <a className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-ink underline underline-offset-4" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Open Google Cloud credentials <ExternalLink size={14} /></a>
        <label className="mt-5 grid gap-2 text-sm font-semibold text-muted">
          Google OAuth client ID
          <input className="focus-ring input-surface min-h-11 w-full rounded-md px-3 py-2 text-sm" value={clientId} onChange={(event) => onClientIdChange(event.target.value)} placeholder="123456789-example.apps.googleusercontent.com" autoComplete="off" />
          <span className="text-xs font-normal text-soft">This is not a secret. Never paste a Google client secret here.</span>
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(clientId.trim())} disabled={!valid}>Save Drive connection</Button>
        </div>
      </div>
    </div>
  );
}
