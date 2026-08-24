# Boilerplate Frontend

A Next.js frontend for the [boilerplate backend](https://github.com/byldd/boilerplate-backend), with payments, chat, real-time updates, and push notifications built in.

---

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (built on Radix UI)
- **Data fetching:** TanStack Query + Axios
- **Payments:** Stripe
- **Chat:** GetStream
- **Real-time:** Socket.IO
- **Push Notifications:** OneSignal

Authentication is handled by the backend (WorkOS AuthKit) — the frontend needs no auth keys.

---

## Prerequisites

- **Node.js 20.9 or newer** — check with `node -v`, install from [nodejs.org](https://nodejs.org)
- **The backend, set up and running** — follow the [backend repo](https://github.com/byldd/boilerplate-backend)'s README first. Every screen in this app talks to the backend API.

The third-party keys you'll need (Stripe, GetStream, OneSignal) come from the same accounts you created while setting up the backend — no extra signups.

---

## Getting Started

### 1. Install dependencies

```bash
npm i
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in your values — every key is documented in the file itself.

Keys are validated on startup, so a missing or malformed value fails immediately with the key's name. Values are baked in when the server starts — after changing one, restart the dev server.

### 3. Start the development server

```bash
npm run dev
```

The app runs at `http://localhost:3000`. If a screen fails to load data, check that the backend is running and `NEXT_PUBLIC_API_URL` points at it.

---

## Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server with hot reload |
| `npm run build`      | Build for production             |
| `npm start`          | Run the production build         |
| `npm test`           | Run unit tests once with Vitest  |
| `npm run test:watch` | Run unit tests in watch mode     |
| `npm run lint`       | Run ESLint                       |

Vitest's browser UI is available via `npm run test:watch -- --ui`, and a coverage report via `npm test -- --coverage` (no extra install needed — Vitest ships the v8 provider).

Unit tests skip env validation, so they run without a `.env` file.

### End-to-end tests

E2E tests (Playwright, in `e2e-tests/`) run against the deployed staging site — not your local server:

```bash
npx playwright install chromium   # first time only
npx playwright test
```

---

## Project Structure

```
src/
├── app/          Routes (Next.js App Router) — pages stay thin and render templates from module/
├── module/       Feature modules (auth, chat, product, …), each with its own
│                 components/, hooks/, templates/, types/, utils/, __tests__/
├── components/   Shared UI — ui/ (shadcn/ui components, add more with `npx shadcn add`), common/ (tables, forms, dialogs)
├── lib/          API client (api.ts), constants, utilities
├── hooks/        Shared React hooks
├── config/       Route definitions
├── styles/       Global styles
└── types/        Shared TypeScript types
```

Rule of thumb: feature-specific code lives in its module under `src/module/`; only genuinely shared code goes in `components/`, `hooks/`, or `lib/`.

---

## Deployment

Pushing to `develop` builds a Docker image and pushes it to AWS ECR (`.github/workflows/ecr-image-deploy.yml`). Deployed builds don't use a committed env file — secrets are fetched from Infisical during the build.
