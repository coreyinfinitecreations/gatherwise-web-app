# Gatherwise Church Management Application

## Architecture Overview

A church management system built with **multi-campus architecture** supporting multiple church locations with shared and isolated data:

- **Church-wide data**: Users, pathways (can be shared), system settings
- **Campus-specific data**: Members, life groups, events, registrations
- **Context-driven UI**: Campus selector affects all data views and API calls

## Key Technologies & Patterns

- **Next.js 15** with App Router + TypeScript
- **Prisma ORM** with PostgreSQL - see `prisma/schema.prisma` for full data model
- **Custom Authentication** using `UserManager` class + passkey support (not NextAuth)
- **React Query** for server state management
- **shadcn/ui** components with custom purple theme
- **Context Providers**: `AuthProvider` + `CampusProvider` for global state

## Critical Architecture Patterns

### Multi-Campus Data Flow

```tsx
// All pages use campus context for data filtering
const { currentCampus } = useCampus();
const { filterByCampus, getFilterParams } = useCampusFilter({
  includeCampusData: true,
  ## Gatherwise — AI agent guidance (concise)

  Overview
  - Next.js (app router) + TypeScript + Tailwind + shadcn/ui. Server data layer: Prisma + PostgreSQL (see `prisma/schema.prisma`). The app is multi-tenant/multi-campus focused (see `prisma` models: `Church`, `Campus`, `User`, `Pathway`).

  Quick developer workflows
  - Run dev: `npm run dev` (Next.js with turbopack). Build: `npm run build`. Lint: `npm run lint` (runs `eslint`).
  - Database: Prisma is used. Env vars: `DATABASE_URL` and `DIRECT_DATABASE_URL` are required. A seed script is present at `prisma/seed.ts` (run with `ts-node` or compile first).

  Project conventions and patterns (important for edits)
  - App router layout/providers: Root layout composes providers in order `QueryProvider` → `AuthProvider` → `CampusProvider` (see `src/app/layout.tsx`). Keep provider order when adding global providers.
  - Auth: custom `UserManager` (in `src/lib/auth/user-manager.ts`) + API endpoints under `src/app/api/auth/*`. UI uses `AuthContext` (client) that stores user in `localStorage` and sets `isAuthenticated` cookie for middleware.
  - Middleware: `src/middleware.ts` protects routes (guards `/dashboard/*`) and relies on cookie `isAuthenticated` or `Authorization` header. Adjust middleware if changing auth flow.
  - Prisma client singleton: import from `src/lib/prisma.ts` (re-uses globalThis in dev). Use this file for all DB access to avoid multiple PrismaClient instances.
  - Passkeys/webauthn: implemented via `src/lib/auth/passkey-manager.ts` and API routes under `src/app/api/auth/passkeys`. The repo uses `@simplewebauthn/*` packages; follow how `PasskeyManager` is used by `UserManager`.

  Code & UI layout conventions
  - Components live under `src/components/*`. UI primitives live in `src/components/ui/*` (shadcn-like patterns). Dashboard pages are under `src/app/dashboard/*`.
  - Server actions and server components: pages under `src/app` often call server-side libraries (Prisma) via API routes or server components — prefer using existing API routes unless you intentionally run DB calls in server components.

  Practical examples to follow
  - To authenticate in a page: call `POST /api/auth/login` (see `src/app/api/auth/login/route.ts`) which uses `UserManager.authenticateUser`.
  - To query DB from server code: import `prisma` from `src/lib/prisma.ts` (avoid `new PrismaClient()` elsewhere).
  - To create seed data: inspect `prisma/seed.ts` — it creates an admin user and demo church/campuses.

  What to watch for (common pitfalls)
  - Don't create multiple PrismaClient instances in dev — always use `src/lib/prisma.ts`.
  - Middleware uses a cookie-based lightweight auth gate — if you change auth, update middleware and `AuthProvider` together.
  - Many helper scripts in `scripts/` talk directly to the DB (`scripts/test-auth.ts`, `scripts/check-users.ts`). They expect the DB envs to be set.

  Files worth reading before major changes
  - `src/lib/auth/user-manager.ts` (auth rules, password policy)
  - `src/lib/prisma.ts` (Prisma singleton)
  - `src/app/layout.tsx`, `src/contexts/auth-context.tsx`, `src/middleware.ts` (auth flow)
  - `prisma/schema.prisma`, `prisma/seed.ts` (data model and sample seed)
  - `src/app/api/*` (examples of server routes and logging style)

  If anything in this guidance is unclear or you want more details (example edits, patterns to preserve, or a specific workflow to automate), tell me which area to expand and I'll iterate.
- **Campus Context** - Always check `currentCampus` before data operations
```
