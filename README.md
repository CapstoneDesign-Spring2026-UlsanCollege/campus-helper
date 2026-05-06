# Campus Helper

Campus Helper is a full-stack smart campus platform for Ulsan College students. It centralizes student workflows such as AI assistance, schedules, notes, marketplace posts, lost-and-found, friend networking, direct chat, and admin notices in one responsive web app.

The project was developed for the Capstone Design Spring 2026 course by **AI Campus Innovators**.

## Project Goals

- Help students find campus information and services faster.
- Provide an AI assistant for academic and campus support.
- Support everyday campus workflows through one authenticated dashboard.
- Give administrators a working console for publishing notices and managing users.
- Maintain project documentation and sprint evidence through GitHub.

## Features

- **Authentication**: signup, login, logout, refresh token flow, password reset flow, protected dashboard routes.
- **AI Assistant**: OpenAI-powered streaming chat with MongoDB chat history persistence and file attachment support.
- **Admin Console**: admin-only notice publishing, user search, user management, protected admin APIs.
- **Student Dashboard**: central campus command view with schedule and quick actions.
- **Timetable**: student schedule management.
- **Notes**: upload and browse study materials.
- **Campus Chat**: friend-to-friend messaging with unread count polling.
- **Network**: friend discovery and connection management.
- **Marketplace**: post and browse campus marketplace items.
- **Lost and Found**: publish and browse lost item posts.
- **Media Uploads**: Cloudinary-backed uploads for files and profile photos.
- **Responsive UI**: modern image-backed campus interface optimized for desktop and mobile.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, Lucide icons |
| Database | MongoDB with Mongoose |
| AI | AI SDK v6, OpenAI provider |
| Auth | JWT access/refresh tokens, bcrypt password hashing, jose/Next proxy protection |
| Uploads | Cloudinary |
| Notifications | react-hot-toast |
| Optional cache/rate limit | Redis / ioredis |
| Deployment target | Vercel or Node.js hosting |

## Deployment

### GitHub Pages

This repository is now prepared to publish a static project site from `docs/` through GitHub Pages.

- Static site entry: `docs/index.html`
- Pages workflow: `.github/workflows/deploy-pages.yml`
- Static asset folder: `docs/assets/`

To enable it on GitHub:

1. Push the repository changes to GitHub.
2. Open `Settings -> Pages`.
3. Set the source to `GitHub Actions`.
4. Let the `Deploy GitHub Pages` workflow publish the `docs/` folder.

Important: GitHub Pages can host the public project website and documentation, but it cannot run the full authenticated app because this project uses server-side APIs, MongoDB, Cloudinary, and AI providers.

### Full App Hosting

For the real application, use a platform that supports Next.js server routes and environment variables, such as:

- Vercel
- Railway
- Render
- Any Node.js server or Docker host

### Vercel From GitHub

This repository is prepared for direct Vercel deployment from GitHub.

1. Import the repository into Vercel.
2. Keep the detected framework as `Next.js`.
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to your production domain, for example:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

5. Redeploy after saving environment variables.

Notes:

- Password reset links use `NEXT_PUBLIC_APP_URL`, `APP_URL`, or the Vercel domain automatically.
- Redis is optional. Without `REDIS_URL`, login rate limiting runs in degraded mode instead of trying to connect to `localhost`.
- JWT secrets are required in production. Runtime fallback secrets were removed.

Required environment variables include:

```env
MONGODB_URI=
REDIS_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
NEXT_PUBLIC_APP_URL=
APP_URL=
SMTP_USER=
SMTP_PASS=
```

You can use `.env.example` as the deployment checklist.

## Repository Structure

```text
src/
  app/                  Next.js pages, layouts, and API route handlers
  components/           Shared UI and dashboard layout components
  lib/                  Auth, database, Redis, and utility helpers
  models/               Mongoose models
public/                 Static assets, including campus_bg.png
docs/                   Capstone project, team, and sprint documentation
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` with:

```env
MONGODB_URI=
REDIS_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
```

## Admin Access

Admin permissions are controlled by the user document in MongoDB:

```js
role: "admin"
```

After promoting a user, log out and log back in so the JWT includes the admin role. The admin console is available at:

[http://localhost:3000/dashboard/admin](http://localhost:3000/dashboard/admin)

## Documentation

- [Project Overview](docs/PROJECT.md)
- [Team Agreement](docs/TEAM_AGREEMENT.md)
- [Sprint Packets](docs/sprints)
- [GitHub Pages Site](docs/index.html)

## Team

| Name | Role |
| --- | --- |
| Laxman Bhattarai | Project Manager |
| Kushal Kharka | Scribe / Sprint PM |
| Bibek Kunwar | QA Lead |
| Ujwol Upreti | Demo Driver / Sprint PM |
| Rajim Danwar | Developer |

## Current Status

Campus Helper is demo-ready with a working full-stack Next.js application, authenticated student workflows, AI assistant, database-backed records, file uploads, and a protected admin console.
