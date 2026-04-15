# Week 3 Issue - Authentication and Database Integration

## Issue Summary

The project needed a secure way to identify users and protect dashboard/API routes.

## Problem

Without authentication, students could not safely access personalized data such as schedules, notes, chats, and profile information. Admin features also required role-based access.

## Impact

- Protected routes could not be trusted.
- User-specific data could be mixed or exposed.
- Admin workflows could not be safely implemented.

## Investigation

The team evaluated user records, password handling, and token-based sessions. The implementation needed:

- password hashing
- login validation
- JWT access and refresh tokens
- protected dashboard/API routes
- MongoDB connection handling

## Resolution

- Implemented signup and login API routes.
- Used bcrypt for password comparison.
- Generated access and refresh tokens.
- Added route protection through Next.js proxy.
- Connected MongoDB through a reusable Mongoose helper.

## Evidence

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/lib/auth.ts`
- `src/lib/mongoose.ts`
- `src/proxy.ts`
- `docs/sprints/week-3.md`

## Status

Resolved.

