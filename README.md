# Shiftcraft

A scheduling tool for restaurant managers. Create weekly schedules, auto-generate them from shift templates, manage your team, and track coverage gaps — all in one place.

---

## What it does

- **Schedule builder** — weekly grid view with drag-and-drop shift management
- **Auto-generate** — punch in a week and let it fill the schedule from your saved shift templates
- **Team management** — add employees, set roles, track weekly hours and estimated salary cost
- **Coverage analysis** — flags understaffed slots based on your operating hours and templates
- **Onboarding flow** — new accounts walk through restaurant setup and template configuration before hitting the app
- **Dark mode** — persisted to localStorage, applied before React mounts to avoid flash

---

## Stack

| | |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Routing** | React Router v7 |
| **Server state** | TanStack Query v5 |
| **Styling** | Tailwind CSS v4 (configured entirely in CSS via `@theme`, no config file) |
| **Auth + DB** | Supabase |
| **HTTP** | Axios with request/response interceptors |
| **Drag and drop** | dnd-kit |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Testing** | Vitest + Testing Library |

App pages are lazy-loaded so the landing and auth bundle stays lean.

---

## Project structure

```
src/
├── components/
│   ├── employees/       # Employee card, create/edit modal
│   ├── layout/          # AppLayout, Sidebar
│   ├── schedules/       # WeeklyGrid, ShiftCard, CoverageGaps, WeekNav
│   ├── shift-templates/ # TemplateRowEditor (shared between setup + settings)
│   └── ui/              # LoadingSpinner, EmptyState, ErrorBoundary, etc.
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api/             # Axios wrappers for each resource
│   ├── hooks/           # TanStack Query hooks
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Date helpers, coverage calculation
└── routes/
    ├── auth/            # Login, Signup, Reset password
    ├── dashboard/
    ├── employees/
    ├── landing/         # Public marketing page
    ├── not-found/
    ├── schedules/
    ├── settings/
    ├── setup/           # Onboarding wizard
    ├── templates/
    ├── OnboardedRoute.tsx
    └── ProtectedRoute.tsx
```

---

## Getting started

**Prerequisites:** Node 18+, a Supabase project, the backend API running locally.

```bash
npm install

cp .env.example .env.local
```

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

---

## Auth flow

Supabase handles auth. On signup, no restaurant row exists yet — the app detects this and redirects to `/setup` where the user names their restaurant and configures shift templates. Once onboarding is marked complete, the `OnboardedRoute` guard lets them through to the main app.

The `ProtectedRoute` → `OnboardedRoute` → `AppLayout` nesting means routing decisions are resolved in order before any page renders — no race conditions between navigation and query results.

---

## Design system

All design tokens live in `src/index.css` inside a `@theme` block — colors, radii, shadows, typography. Component classes (`.btn-primary`, `.card`, `.input-field`, etc.) are defined in `@layer components`. Dark mode overrides use a `[data-theme="dark"]` attribute selector on `<html>`.

The landing page uses a separate `landing.css` with `lp-` prefixed classes to keep its styles fully isolated from the app shell.

---

## Scripts

```bash
npm run dev           # Dev server (localhost:5173)
npm run build         # Type-check + production build
npm run preview       # Preview production build locally
npm run test          # Watch mode tests
npm run test:run      # Single test run
npm run test:coverage
```
