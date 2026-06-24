# Atlas — Client Project Tracker

A clean, responsive app for a digital agency to manage client projects (create,
view, edit, delete), built as a genuine server-rendered Next.js application
rather than a client-only SPA.

The seed data is the provided `test_data.json`. There is no real backend;
mutations run through Server Actions against an in-memory store.

---

## Setup instructions

Requires **Node 18.17+**.

```bash
npm install
```

## How to run

```bash
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build (validates Cache Components / PPR)
npm run start        # serve the production build
npm run lint         # eslint
npm run test         # vitest (watch)
npm run test:run     # vitest (single run) — 30 unit tests
```

## What it does

- **Project list** — client, project, status, priority and due date, with an
  overdue indicator and a dashboard summary.
- **Create / Edit / Delete** — via Server Actions, with full validation.
- **Search, filter (status & priority) and sort** — driven through the URL, so
  every view is shareable and bookmarkable.
- **UI states** — loading (Suspense skeletons), empty (with a "no results vs no
  matches" distinction) and error (route error boundary).
- **Light / dark mode** and a responsive layout (375 → 1440px).

---

## Technology choices

| Choice                              | Why                                                                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router)**         | Server Components for reads, Server Actions for writes, plus Cache Components / PPR / Suspense streaming — a real server-rendered app, not a client SPA. |
| **React 19 + TypeScript (strict)**  | Type-safe domain model; `STATUSES`/`PRIORITIES` drive the TS unions, Zod enums, and UI from one source.                                                  |
| **Tailwind v4 + shadcn/ui (Radix)** | Accessible primitives, re-skinned through CSS tokens; fast, consistent, responsive styling.                                                              |
| **Zod**                             | One schema shared by client and server validation — single source of truth.                                                                              |
| **Vitest + React Testing Library**  | Fast unit tests for the pure logic (schema, query, format) and sync components.                                                                          |
| **sonner / next-themes**            | Toast feedback for mutations; light/dark mode.                                                                                                           |

## Assumptions made

- **No database.** `test_data.json` seeds an in-memory store
  (`lib/projects/store.ts`), seeded from a deep clone so the fixture file is
  never mutated. Data persists while the server runs and resets on restart —
  an intentional choice for an assessment. Swapping in a real DB means changing
  only that one file.
- **Single user, no auth.** The brief describes an internal agency tool, so no
  authentication/authorization layer was added.
- **Artificial latency** (~350ms) in the read layer makes the loading/streaming
  states visible and demonstrable.
- **`due ≥ start`** is treated as a validation rule; equal dates are allowed.
- **Description is optional** and defaults to an empty string.

---

## Technical reflection

**1. Why did you choose this implementation approach?**
I chose Next.js as the framework because I wanted to make use of its server-side
features and caching. I also wanted the project to feel closer to a real-world
app, so I simulated a real server experience by adding a small delay when
fetching data instead of making everything instant.

My goal was to make sure the data is fetched efficiently, mostly from the server
side, while still giving users a smooth experience. For example, when filtering
projects, instead of making the UI feel frozen while waiting for the list to
update, I show skeleton loaders. And when a user adds or updates a project, the
modal closes right away and the updated project appears immediately in the list.
I used optimistic updates for that so the app feels faster and more responsive.

**2. What tradeoffs did you make?**
One tradeoff I made was intentionally adding around a 350ms delay to the data
fetching. The downside is that the app feels a bit slower than it actually could
be, but I did that on purpose to make the skeleton loaders and streaming behavior
visible. If everything loaded instantly, those parts of the implementation would
be harder to notice.

**3. What would you improve given additional time?**
If I had more time, I would replace the provided JSON data file with a real
database. The current structure is already prepared for that, so the next step
would be connecting it to a proper backend/database setup and making the data
persistent.

**4. What was the most challenging part of this assessment?**
The most challenging part for me was the optimistic updates. I wanted the project
to show up immediately when the user adds or edits it, instead of making them
wait for the server response. But it was tricky because I still had to make sure
the UI stays consistent with what the server actually saves.

I had to understand how to show the update instantly first, then either keep it,
correct it, or remove it if the server does not accept the change. That part took
me some time to understand, but with the help of AI, I was able to integrate it
smoothly.

**5. Did you use AI tools during development?**
Yes, I used Claude Code during development. I used it mainly to help with the
initial project structure, coding support, and to get feedback on the system
design I was planning. But I made sure the implementation still followed my own
idea and that I understood the structure and decisions behind it.

---

## Project structure

```
app/                     routes, layout, loading/error/not-found, @modal slot
components/
  ui/                    shadcn/ui primitives (Radix), re-skinned
  projects/              domain components (list, item, form, badges, toolbar…)
  theme/  layout/        theme provider + toggle, app header
lib/projects/            types, zod schema, store, cached data, query, actions
```
