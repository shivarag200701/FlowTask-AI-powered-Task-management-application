<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**A full-stack task app with a versioned API, production-minded auth, and a React client built around clear data boundaries, TanStack Query, and an internal design system.**

[Overview](#-overview) • [API versions](#-api-versions-v1--v2) • [Architecture](#-architecture) • [Features](#-features) • [Getting started](#-getting-started) • [Roadmap](#-roadmap)

</div>

---

## Overview

This monorepo is a **solo-developed** todo application. The current product is centered on **API v2** and a **revamped React frontend**: new contracts for tasks and tags, **string-based task IDs (CUID)**, **fractional-index style `sortKey`** ordering for drag-and-drop, and a **UI layer** composed from shared primitives.

**Earlier work (v1)** included a different task model (numeric IDs) and experiments around **recurring tasks**. Recurrence lived in the older schema and routes; **v2 intentionally dropped recurrence columns** to stabilize the core model first. **Recurring tasks are not part of the current v2 UX**; bringing recurrence back is a **planned** feature on top of the v2 data model.

The **README** is kept aligned with what the **v2 client and routes** actually ship, so demos and onboarding match the repository.

---

## API versions (v1 / v2)

Routes are mounted under **`/api`**.

| Area                                 | Version                                     | Notes                                                                                                                                               |
| ------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tasks & tags (current product)**   | **v2** (`/api/v2/todo`, `/api/v2/tag`)      | Zod-validated query/body shapes (`@shiva200701/todotypes`), bulk helpers, Prisma models with `sortKey` and tag relations.                           |
| **Auth, sessions, OAuth, email OTP** | **v1** (`/api/v1/user`, `/api/v1/oauth`, …) | Sign-in, sign-up, **email OTP** verification, Google OAuth. **Redis-backed rate limiting** (e.g. OTP abuse protection via `rate-limiter-flexible`). |
| **Legacy todo API**                  | **v1** (`/api/v1/todo`)                     | Older handlers; recurrence-related paths exist mostly as **commented** history. New UI work targets **v2**.                                         |

**Auth check (cookie session):** `GET /api/v1/auth-check`

This split is deliberate: **v2** is a **contract reset** for the domain you are shipping today, while **v1** still carries **session-based auth** and OAuth flows until you choose to unify everything under a single versioned surface.

---

## Architecture

### Monorepo layout

```
personalTodoApp/
├── frontend/     # React 19 + TypeScript + Vite
├── backend/      # Express + TypeScript + Prisma
└── common/       # Shared utilities / types packaging
```

### Frontend (React — production-style client structure)

- **TanStack Query (React Query)** for server state, mutations, and cache invalidation.
- **Centralized query keys** in `frontend/src/query-keys/` (`todosQueryKeys`, `tagsQueryKeys`, `authQueryKeys`, `onboardingQueryKeys`, `userPreferenceKeys`) so invalidation stays consistent when filters or auth change.
- **HTTP layer split from UI** in `frontend/src/api/` (e.g. `todos`, `tag`, `user`, `onboarding`) — components and hooks do not embed raw URLs everywhere.
- **React Context** for cross-cutting UI concerns (for example **auth**, **signup flow**, **task display preferences**, **task selection**), not as a second copy of the server cache.
- **Design system** under `frontend/src/components/ui/` (buttons, sheets, inputs, sidebar, OTP input, toasts, etc.) so product screens stay thin and visually consistent.
- **React Router** for public vs protected routes and onboarding.
- **Tailwind CSS**, **Radix-style** primitives, **Motion** where used, **next-themes** for theming.

### Backend

- **Express** with **TypeScript**, **Prisma**, **PostgreSQL**.
- **Redis**: sessions (`connect-redis`), rate limiter client initialization, queue-related infrastructure.
- **Zod** / shared types via **`@shiva200701/todotypes`** for request validation on v2.
- **Email** (e.g. Resend) and **React Email** templates for transactional messages including OTP.
- **BullMQ** / queue service for notification-style background work where enabled.

### DevOps and environments

The application is **environment-driven**: each deployment should use its own **`DATABASE_URL`**, **`REDIS_URL`**, **`SESSION_SECRET`**, **`FRONTEND_URL`**, OAuth secrets, and mail provider keys.

**Recommended practice** (and what this project is structured toward):

- **Separate environments** for **local development**, **automated testing**, **staging**, and **production**, each with isolated databases and secrets.
- **CI/CD** that at minimum runs **lint**, **typecheck**, and **build** for frontend and backend, runs **Prisma migrate** (or equivalent) against the target database policy for that environment, and deploys artifacts to your host (Railway, Fly, AWS, etc.). Pipeline YAML may live in this repo or in private infra depending on your setup; the important part is that **promotion** flows **test → staging → production** with different credentials per stage.

**In progress / planned:** broader **automated test suites** (unit, integration, E2E), **observability** (structured logging, error tracking, optional APM), and tighter **monitoring** of queues and auth endpoints.

---

## Features

### Shipped in the current v2-focused product

- **Tasks**: create, edit, complete, delete; priorities; colors; all-day vs timed tasks; **drag-and-drop reorder** backed by **`sortKey`** on the server.
- **Tags**: create and manage tags; associate tags with tasks; filter tasks by tags (v2 query params).
- **Views**: **Today**, **Upcoming**, **Tags** management, **Todos**; **Today** supports **list** and **board** display modes. User preferences can model a **calendar** display mode; the **full calendar view for Today is not wired in `Today.tsx` yet** (only list and board render there).
- **Onboarding**: guided steps after signup.
- **Authentication**: sign-in and sign-up flows with **email OTP** (rate-limited), password flows where applicable, **Google OAuth** (v1 routes), **Redis-backed sessions**.
- **UX**: keyboard shortcuts, toasts, responsive layout, dark/light themes.

### Natural language dates

The client stack includes **chrono-node** for parsing natural language in forms where integrated (for example due-date style inputs). Supported phrases depend on the wired UI (e.g. “tomorrow”, “next Monday”).

### Not currently in v2 (see roadmap)

- **Recurring tasks** (previously explored on v1 / old schema; **not** active in v2 API or Prisma `Todo` model).
- **Dedicated month calendar page** as a first-class route (calendar UI primitives exist; product integration is partial).

---

## Getting started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm**
- **PostgreSQL** (v14 or higher)
- **Redis** (sessions + rate limiting + optional queues)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/personalTodoApp.git
   cd personalTodoApp
   ```

2. **Install dependencies**

   ```bash
   cd common && npm install
   cd ../backend && npm install
   cd ../frontend && npm install
   ```

3. **Database and Prisma** (from `backend/`)

   ```bash
   cd backend
   # Create .env (see below)
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **Environment variables**

   **`backend/.env`** (example — adjust per environment):

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/todoapp?schema=public"
   SESSION_SECRET="your-super-secret-session-key"
   REDIS_URL="redis://localhost:6379"
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"

   # OAuth (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/oauth/google/callback"

   # Email / OTP (as required by your auth setup)
   # RESEND_API_KEY=...
   ```

   **`frontend/.env`** (or `.env.local`):

   ```env
   VITE_API_URL="http://localhost:3000"
   ```

5. **Run Redis** (local example)

   ```bash
   brew services start redis
   # or: docker run -d -p 6379:6379 redis:latest
   ```

6. **Run the apps**

   Backend (development):

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

   Open **`http://localhost:5173`**.

### Production build

```bash
cd backend && npm run build && npm start
cd ../frontend && npm run build
```

Serve the frontend `dist/` with your static host or reverse proxy, and point `FRONTEND_URL` / CORS at that origin.

---

## Usage (quick)

- **Sign up / sign in** via the landing flow; complete **OTP** steps when email verification is required.
- **Today / Upcoming**: add tasks from the inline or modal flows; use **Display** to switch **list** vs **board** where available.
- **Tags**: manage tags under **Tags**; filter **Today** tasks using tag selections as implemented in the toolbar.
- **Keyboard shortcuts** (where enabled): e.g. shortcuts documented in-app or in `TaskToolBar` / global hotkey hooks.

---

## Roadmap

High-level priorities:

1. **Recurrence on v2** — redesign series vs instances on top of CUID tasks and current ordering.
2. **Calendar view** — finish wiring **calendar** `viewMode` for Today (or a dedicated route) using existing UI primitives.
3. **Testing** — unit tests for hooks and utils, API integration tests, Playwright (or similar) for auth + critical paths.
4. **Monitoring** — structured logs, error reporting, health checks for API and workers.
5. **CI/CD hardening** — enforce the test/staging/prod pipeline in-repo (workflows) if not already committed.
6. **Optional README items** from [Todo.md](./Todo.md): search, bulk ops, subtasks, export/import, etc.

---

## Contributing

Contributions are welcome.

1. Fork and clone.
2. Branch: `git checkout -b feature/your-feature`.
3. Match existing **TypeScript**, **ESLint**, and **folder conventions** (`api/`, `query-keys/`, `components/ui/`).
4. Prefer **v2** APIs for new task/tag features unless you are explicitly extending auth under **v1**.
5. Open a PR with a clear description and any migration notes.

---

## License

This project is licensed under the **ISC License**. See [LICENSE](LICENSE).

---

## Acknowledgements

Built with [React](https://react.dev/), [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/), [TanStack Query](https://tanstack.com/query), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Zod](https://zod.dev/), and other libraries listed in each package’s `package.json`.

---

<div align="center">

**Made with care by Shiva raghav Rajasekar**

</div>
