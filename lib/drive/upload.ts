import { google } from "googleapis";

export async function uploadPdfToDrive(input: {
  accessToken: string;
  filename: string;
  pdf: Buffer;
}) {
  const auth = new google.auth.OAuth2(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ access_token: input.accessToken });

  const drive = google.drive({ version: "v3", auth });
  const { Readable } = await import("node:stream");

  const response = await drive.files.create({
    requestBody: {
      name: input.filename,
      mimeType: "application/pdf",
    },
    media: {
      mimeType: "application/pdf",
      body: Readable.from(input.pdf),
    },
    fields: "id, webViewLink",
  });

  return response.data;
}
