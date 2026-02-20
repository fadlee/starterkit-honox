# AGENTS.md — app/

## Package Identity
- `app/` contains the Honox application: routes, islands, shared libs, and UI components.
- Primary stack here is TypeScript + Hono/Honox JSX + Tailwind CSS v4.

## Setup & Run (Bun)
```bash
bun install
bun run dev
bun run build
bunx tsc --noEmit
```

## Patterns & Conventions
- Organize by responsibility:
  - `app/routes/**`: URL entrypoints only.
  - `app/islands/**`: interactive client behavior.
  - `app/lib/**`: shared business/data utilities.
  - `app/components/**`: reusable presentational primitives/features.
- ✅ **DO** keep route modules thin and delegate rendering to page islands (example: `app/routes/index.tsx`).
- ✅ **DO** map route params then pass as props to islands (example: `app/routes/courses/[courseslug].tsx`).
- ✅ **DO** use shared API client wrappers from `app/lib/api-client.ts` and domain storage wrappers like `app/lib/lms-storage.ts`.
- ✅ **DO** use shared utility `cn` for composing class names (example: `app/components/ui/button.tsx`).
- ✅ **DO** keep theme tokens in CSS variables and consume with `hsl(var(--...))` (example: `app/style.css`).
- ❌ **DON'T** use demo route code as production backend style (`app/routes/api/todos.ts` is a lightweight demo path).
- ❌ **DON'T** bypass `@/*` alias with deep brittle relative imports when an alias path is available.

## Touch Points / Key Files
- App entry (server): `app/server.ts`
- HTML shell + UI controller mounts: `app/routes/_renderer.tsx`
- Client hydration + Turbo behavior: `app/client.ts`
- API client wrapper: `app/lib/api-client.ts`
- LMS domain client layer: `app/lib/lms-storage.ts`
- Global styles/tokens: `app/style.css`

## JIT Index Hints
```bash
# Find route entry files
rg -n "export default createRoute" app/routes

# Find page islands
rg -n "export default function .*Page" app/islands/lms/pages

# Find shared lib APIs
rg -n "export (async )?function" app/lib

# Find UI primitive exports
rg -n "export function" app/components/ui
```

## Common Gotchas
- Honox JSX uses `class`, not React-style `className`.
- Turbo + island hydration relies on `app/client.ts`; keep turbo lifecycle hooks intact.
- Cloudflare worker data in this project is in-memory mock store; state is not persistent.

## Pre-PR Checks
```bash
bunx tsc --noEmit && bun run build
```
