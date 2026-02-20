# AGENTS.md — app/islands/lms/

## Package Identity
- `app/islands/lms/` contains interactive LMS client islands: pages and client hooks.
- These components handle auth-gated UX, data fetching orchestration, and navigation flows.

## Setup & Run (Bun)
```bash
bun run dev
bun run build
bunx tsc --noEmit
```

## Patterns & Conventions
- Structure:
  - `pages/*.tsx` for screen-level containers.
  - `hooks/*.ts` for reusable behavior (`use-auth`, navigation, responsive hooks).
- ✅ **DO** gate privileged pages via `useAuth` checks and redirect via navigation helpers (example: `pages/course-builder-page.tsx`).
- ✅ **DO** call domain API wrappers in `app/lib/lms-storage.ts` and `app/lib/auth-storage.ts`.
- ✅ **DO** compose feature sections from `app/components/lms/**` and `app/components/ui/**`.
- ✅ **DO** show user feedback through shared toast utility (`app/lib/toast.ts`).
- ✅ **DO** keep navigation side effects inside `go/replace/replaceUrl` helpers (example: `hooks/navigation.ts`).
- ❌ **DON'T** call `fetch` directly from LMS pages when a lib wrapper already exists.
- ❌ **DON'T** duplicate auth bootstrap/session race handling; reuse `hooks/use-auth.ts`.

## Touch Points / Key Files
- Auth state + login/register/logout flow: `app/islands/lms/hooks/use-auth.ts`
- Navigation wrappers: `app/islands/lms/hooks/navigation.ts`
- Main dashboard UI shell: `app/islands/lms/pages/dashboard-page.tsx`
- Course builder flow: `app/islands/lms/pages/course-builder-page.tsx`
- Course learning/player flow: `app/islands/lms/pages/course-player-page.tsx`

## JIT Index Hints
```bash
# Find LMS page components
rg -n "export default function .*Page" app/islands/lms/pages

# Find auth usage across pages
rg -n "useAuth\(" app/islands/lms

# Find API wrapper calls
rg -n "from '@/lib/(lms-storage|auth-storage)'|await .*\(" app/islands/lms

# Find redirects/navigation
rg -n "go\(|replace\(" app/islands/lms
```

## Common Gotchas
- Turbo page lifecycle can re-enter islands; keep side effects idempotent.
- `useAuth()` initially loads asynchronously (`loading` state), so guard early renders.
- Route-level server rendering still wraps these islands, so avoid browser globals at module scope.

## Pre-PR Checks
```bash
bunx tsc --noEmit && bun run build
```
