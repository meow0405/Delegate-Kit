"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { CustomCursor } from "@/components/ui/CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const content = (
    <>
      <CustomCursor />
      {children}
    </>
  );

  if (!clientId || clientId === "YOUR_GOOGLE_OAUTH_CLIENT_ID") {
    return content;
  }

  return <GoogleOAuthProvider clientId={clientId}>{content}</GoogleOAuthProvider>;
}
