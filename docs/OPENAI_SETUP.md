# OpenAI Setup

Campus Helper uses the OpenAI provider through AI SDK v6 for the AI Assistant page.

## Required Environment Variable

Set this variable in `.env.local` for local development and in your hosting provider for production:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Do not commit real API keys to GitHub. The repository includes `.env.example` with empty placeholders only.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `OPENAI_API_KEY` and the other required environment variables.
3. Restart the dev server after changing `.env.local`.

```bash
npm run dev
```

## Production Setup

If deploying to Vercel or another host, add `OPENAI_API_KEY` in the provider's environment variable settings. Do not paste it into source code.

## Verification

1. Log in to Campus Helper.
2. Open `/dashboard/ai`.
3. Send a short prompt such as:

```text
Summarize what Campus Helper can do for a student.
```

Expected result: the assistant streams a response. If the key is missing, the API returns:

```json
{
  "error": "OPENAI_API_KEY is not configured on the server"
}
```

## Security Note

If an API key is accidentally posted in chat, screenshots, commits, or issues, rotate it in the OpenAI dashboard and replace the environment variable with the new key.
