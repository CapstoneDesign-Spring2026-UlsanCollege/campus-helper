# Week 2 Issue - Frontend and Backend Connection Plan

## Issue Summary

The team had early frontend pages and a dashboard direction, but the frontend and backend were not fully connected yet.

## Problem

The app needed real data flow instead of static or mock UI. The team needed to decide how pages, API routes, authentication, and database models would fit together.

## Impact

- Login and dashboard pages existed conceptually but could not yet support real users.
- Campus modules risked becoming disconnected mock screens.
- The team needed a clear backend structure before adding more features.

## Investigation

The team reviewed the planned modules:

- login/signup
- timetable
- notes
- market
- lost-and-found
- friends/network
- chat
- AI assistant

The project direction moved from a simple static frontend toward a full-stack web app.

## Resolution

- Adopted a Next.js full-stack structure with API route handlers.
- Planned MongoDB/Mongoose models for persistent data.
- Organized dashboard pages by feature.
- Identified authentication as the next major blocker.

## Evidence

- `src/app/dashboard/*`
- `src/app/api/*`
- `docs/sprints/week-2.md`

## Status

Resolved.

