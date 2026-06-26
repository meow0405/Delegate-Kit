"use client";

import { Cloud, CheckCircle2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "./Button";
import { useDelegateStore } from "@/lib/store/delegateStore";

export function DriveConnectButton() {
  const clientConfigured =
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_OAUTH_CLIENT_ID";

  if (!clientConfigured) {
    return (
      <Button variant="secondary" disabled title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local">
        <Cloud size={16} />
        Drive not configured
      </Button>
    );
  }

  return <ConfiguredDriveConnectButton />;
}

function ConfiguredDriveConnectButton() {
  const driveToken = useDelegateStore((state) => state.driveToken);
  const setDriveToken = useDelegateStore((state) => state.setDriveToken);
  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.file",
    onSuccess: (tokenResponse) => setDriveToken(tokenResponse.access_token),
  });

  return (
    <Button variant={driveToken ? "secondary" : "primary"} onClick={() => login()}>
      {driveToken ? <CheckCircle2 size={16} /> : <Cloud size={16} />}
      {driveToken ? "Drive connected" : "Connect Google Drive"}
    </Button>
  );
}
