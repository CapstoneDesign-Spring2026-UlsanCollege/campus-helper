# Campus Helper - Capstone Project Overview

## Team Information

**Team Name**: AI Campus Innovators
**Repository**: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper

| Name | Role Rotation (First Week) |
| --- | --- |
| Laxman Bhattarai | Project Manager |
| Kushal Kharka | Scribe |
| Bibek Kunwar | QA Lead |
| Ujwol Upreti | Demo Driver |
| Rajim Danwar | Developer |

## Project Title

Campus Helper

## Problem Statement

Students often struggle to find important campus information quickly. Class schedules, study materials, campus services, lost-and-found posts, marketplace items, and communication tools are often spread across different systems. This creates friction for both new and returning students.

Campus Helper solves this problem by organizing key student workflows into one authenticated web platform.

## Target Users

- University students
- New students unfamiliar with campus workflows
- Faculty or staff who need to publish notices
- Student communities that need communication and resource-sharing tools

## Project Goal

The goal is to build a full-stack web application that helps students access campus information, communicate with classmates, manage academic resources, and ask questions through an AI assistant.

## Core Features

- User signup, login, logout, and protected dashboard access
- AI campus assistant with streaming responses and saved chat history
- Student timetable management
- Study notes upload and browsing
- Campus marketplace posts
- Lost-and-found posts
- Friend network and direct chat
- Admin notice publishing and user management
- File uploads through Cloudinary

## Demo Scenario

1. A student opens Campus Helper.
2. The student logs in and sees the dashboard.
3. The student opens timetable, notes, marketplace, lost-and-found, or chat.
4. The student asks the AI assistant for study or campus help.
5. The AI assistant streams a response and saves the conversation.
6. An admin logs in and publishes a campus notice.

## Minimum Viable Product

The MVP is a working Next.js web application where students can sign up, log in, access dashboard features, use a streaming AI assistant, manage schedules and notes, exchange messages, and browse campus service modules. Admins can publish campus notices and manage users.

## Stretch Goals

- Push notifications for events and assignments
- Native mobile companion app
- Advanced campus map data
- Voice-based AI interaction
- Multi-language support
- Analytics dashboard

## Technology Stack

| Area | Tool |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js App Router API routes |
| Database | MongoDB with Mongoose |
| AI | AI SDK v6 with OpenAI |
| Auth | JWT, bcrypt, jose, Next proxy |
| Uploads | Cloudinary |
| Hosting | Vercel or Node.js hosting |

## Project Scope Rules

- Prioritize working software over large speculative features.
- Keep all core workflows demoable.
- Document progress through sprint packets.
- Add features gradually and verify with build/type checks.
