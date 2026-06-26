# Delegate Kit

Delegate Kit is a Model UN preparation workspace built with Next.js, Prisma SQLite, local/online LLM providers, PDF export, and optional Google Drive upload.

## Free-First AI Setup

The app supports three providers:

- `ollama`: free local inference on your machine.
- `gemini`: online provider with a free tier when you provide a Gemini API key.
- `openai`: supported, but not free.

For a free GitHub-ready setup, copy the env template:

```powershell
Copy-Item .env.example .env.local
```

Use local Ollama:

```env
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2:1b"
```

Then install and run the model:

```powershell
ollama pull llama3.2:1b
ollama serve
```

`llama3.2:1b` is the default lightweight fallback model. It is small enough for most laptops and still reliable for short structured JSON responses. If your machine can comfortably run a larger model, you can switch `OLLAMA_MODEL` to something stronger such as `llama3.1:8b`.

Or use Gemini free-tier mode:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_key_here"
GEMINI_MODEL="gemini-1.5-flash"
```

Do not commit `.env.local`. It is ignored by git.

## API Key Security

Your provider keys should live only in `.env.local` or your hosting provider's encrypted environment variable settings.

The frontend never receives:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_SECRET`

Only `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is public, because browser OAuth needs a public client id.

For a public deployment, set Basic Auth credentials:

```env
APP_BASIC_AUTH_USER="your-user"
APP_BASIC_AUTH_PASSWORD="a-long-random-password"
```

When those two variables are set, every page and API route is protected by browser Basic Auth.

### Can Users Connect Their Own ChatGPT Or Gemini?

For this app, the safe production model is:

1. **Owner-managed keys:** you set `OPENAI_API_KEY` or `GEMINI_API_KEY` in the server environment. Users never see the key.
2. **Local/free mode:** users run Ollama on their own machine.
3. **Future BYOK mode:** users paste their own OpenAI/Gemini API key for one request or into an encrypted account vault. Do not store user API keys in plain localStorage or in the database without encryption.

OpenAI and Gemini API calls use API keys. This is different from "logging into ChatGPT" in the browser. Google Drive is the part that uses OAuth because users are granting access to their Drive files.

## Local Development

Install dependencies:

```powershell
npm install
```

Create/update the local database:

```powershell
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
```

Run the app:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## File Storage

PDF exports are stored locally by default under:

```text
public/exports
```

To store generated files in another folder on your system, set:

```env
LOCAL_EXPORT_DIR="C:\Users\YourName\Documents\DelegateKitExports"
```

If `LOCAL_EXPORT_DIR` is outside `public`, the app serves PDFs through:

```text
/api/export/files/[filename]
```

Generated exports are ignored by git.

## Google Drive Upload

Users can connect Google Drive from the workspace and upload generated PDFs.

Set:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Use the Google OAuth scope:

```text
https://www.googleapis.com/auth/drive.file
```

This lets the app create/upload files that the app owns without broad Drive access.

For local development, add this JavaScript origin in Google Cloud:

```text
http://localhost:3000
```

## GitHub Safety

The repo ignores:

- `.env*` except `.env.example`
- documentation `.md` files except `README.md`
- local SQLite DB files
- generated PDF exports
- Next build output
- dependencies

This keeps GitHub focused on the runnable app while leaving local planning, security review notes, and generated reports on your machine.

Before pushing:

```powershell
npm run check:env
npm run lint
npm run build
npm run security:audit
```

Local-only documentation and test reports are intentionally ignored by git. Keep public setup and usage notes in this README.

## Important Routes

- `/dashboard`: saved kits
- `/kit/setup`: create a MUN workspace
- `/workspace?kit=...`: overview, stance, news, speech, export
- `/workspace/matrix?kit=...`: relations matrix
- `/workspace/blocs?kit=...`: bloc and seating map

API routes:

- `/api/ai/status`
- `/api/ai/stance`
- `/api/ai/speech`
- `/api/ai/relations`
- `/api/export/position-paper`
- `/api/export/files/[filename]`
- `/api/drive/upload`
- `/api/kits`
- `/api/kits/[kitId]`
- `/api/speeches/[speechId]`

## Current Notes

Analyze Stance is strict: it requires a working provider and will show an error instead of fake output.

Some other AI features still have local fallback behavior so the app remains usable offline, but for best quality you should run Ollama or configure Gemini.
