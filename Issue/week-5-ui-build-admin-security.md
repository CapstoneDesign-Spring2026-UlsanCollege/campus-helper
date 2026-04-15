# Week 5 Issue - UI Polish, Build Stability, and Admin Security

## Issue Summary

As the app became more complete, several quality and security issues appeared around UI polish, production builds, and admin permissions.

## Problem

The team found three major problems:

1. The UI had heavy neon styling and needed a more professional campus product feel.
2. The build depended on remote Google font fetching, which could fail in restricted environments.
3. Admin notice APIs did not consistently verify that the requester was an admin.

## Impact

- The app looked less polished for a final demo.
- Production builds could fail due to external font network requests.
- Non-admin users could potentially reach admin endpoints if requests were not properly checked.

## Investigation

The team ran TypeScript and production build checks, inspected Next.js 16 documentation, and reviewed admin API routes. The app also had a deprecated `middleware.ts` convention that needed to become `proxy.ts`.

## Resolution

- Refreshed the visual design into a calmer campus command-center UI.
- Removed remote Google font imports and used local/system font stacks.
- Renamed `middleware.ts` to `proxy.ts` for Next.js 16.
- Added strict JWT admin role verification to admin APIs.
- Rebuilt the admin page with token-aware requests and clear feedback states.

## Evidence

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/proxy.ts`
- `src/app/dashboard/admin/page.tsx`
- `src/app/api/admin/announcements/route.ts`
- `src/app/api/admin/users/route.ts`
- `docs/sprints/week-5.md`

## Status

Resolved.

