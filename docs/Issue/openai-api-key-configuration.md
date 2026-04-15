# Issue - OpenAI API Key Configuration

## Issue Summary

The AI Assistant depends on `OPENAI_API_KEY`. If the key is missing from the server environment, the AI page cannot send prompts to OpenAI.

## Problem

The app should not store real API keys in GitHub, but developers and deployment environments still need a clear setup path.

## Impact

- The AI assistant fails if `OPENAI_API_KEY` is not configured.
- A vague server error makes the problem harder to debug.
- Committing the real key would expose private credentials.

## Resolution

- Added `.env.example` with empty environment variable placeholders.
- Added `docs/OPENAI_SETUP.md` with local and production setup instructions.
- Updated the AI chat API route to return a clear 503 error if `OPENAI_API_KEY` is missing.
- Kept the real API key out of source control.

## Verification

- Run `npm install`.
- Copy `.env.example` to `.env.local`.
- Add the real key locally or in the hosting provider environment settings.
- Restart the app and test `/dashboard/ai`.

## Status

Resolved for repository setup. Production still requires configuring the secret in the deployment environment.
