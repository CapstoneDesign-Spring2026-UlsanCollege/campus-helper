# Week 4 Issue - AI Assistant Integration

## Issue Summary

The AI assistant was a core feature, but the first implementation had compatibility issues with the installed AI SDK version.

## Problem

The app used an older `useChat` pattern with fields such as `input`, `handleSubmit`, and `isLoading`. The installed AI SDK expected the newer v6 API pattern using:

- `DefaultChatTransport`
- `sendMessage`
- `status`
- `UIMessage.parts`
- `toUIMessageStreamResponse`

## Impact

- Students could not reliably send messages to the AI assistant.
- TypeScript reported errors.
- Chat history persistence did not match the AI SDK message shape.

## Investigation

The team inspected the installed AI SDK type definitions and compared them with the current AI page implementation. The mismatch showed that the chat page and API route needed a full migration to AI SDK v6.

## Resolution

- Rebuilt the AI page around `DefaultChatTransport`.
- Tracked input locally with React state.
- Submitted messages through `sendMessage`.
- Rendered text from `UIMessage.parts`.
- Returned streamed UI message responses from the API route.
- Updated MongoDB chat history to store AI SDK-compatible messages.

## Evidence

- `src/app/dashboard/ai/page.tsx`
- `src/app/api/ai/chat/route.ts`
- `src/models/ChatHistory.ts`
- `docs/sprints/week-4.md`

## Status

Resolved.

