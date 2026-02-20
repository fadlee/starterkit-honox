# AGENTS.md — app/routes/api/

## Package Identity
- `app/routes/api/` hosts JSON API endpoints for auth, courses, topics, lessons, users, and demos.
- Pattern is `createRoute(...)` handlers with shared auth, validation, and error utilities.

## Setup & Run (Bun)
```bash
bun run dev
bun run build
bunx tsc --noEmit
```

## API Patterns & Conventions
- ✅ **DO** use `createRoute` from `honox/factory` for each handler (example: `app/routes/api/courses.ts`).
- ✅ **DO** wrap handlers in `try/catch` and delegate to `handleApiError` (example: `app/routes/api/users.ts`).
- ✅ **DO** set no-store caching for dynamic APIs via `setNoStore(c)` (example: `app/routes/api/auth/session.ts`).
- ✅ **DO** parse body via `readJsonBody` and field-level validators/parsers from `app/lib/server/lms-payloads.ts`.
- ✅ **DO** enforce auth/role checks via `requireAuth` / `requireAdmin` from `app/lib/server/api-auth.ts`.
- ✅ **DO** keep storage access in `app/lib/server/lms-store.ts`; route files should orchestrate only.
- ❌ **DON'T** manually parse and validate JSON inline for production endpoints (anti-pattern example: `app/routes/api/todos.ts`).
- ❌ **DON'T** return ad-hoc status handling when `ApiError` helpers exist (`badRequest`, `unauthorized`, etc.).

## Touch Points / Key Files
- Auth helpers and cookie/session policy: `app/lib/server/api-auth.ts`
- API utility/error helpers: `app/lib/server/api-utils.ts`
- Payload parsing/coercion: `app/lib/server/lms-payloads.ts`
- In-memory domain store: `app/lib/server/lms-store.ts`
- Good endpoint example: `app/routes/api/courses.ts`
- Dynamic nested route example: `app/routes/api/courses/[courseId]/topics.ts`

## JIT Index Hints
```bash
# Find all API route files
find app/routes/api -type f -name "*.ts"

# Find endpoints that need admin
rg -n "requireAdmin" app/routes/api

# Find payload parser usage
rg -n "parse[A-Za-z]+Input" app/routes/api app/lib/server

# Find error handling coverage
rg -n "handleApiError|ApiError" app/routes/api app/lib/server
```

## Common Gotchas
- Data is process-memory (`__LMS_MOCK_STORE__`) and resets on restart/redeploy.
- `setSessionCookie` sets `secure` only on HTTPS requests; local HTTP behavior differs.
- Ensure route param names align with folder params (`[courseId]`, `[lessonId]`, etc.).

## Pre-PR Checks
```bash
bunx tsc --noEmit && bun run build
```
