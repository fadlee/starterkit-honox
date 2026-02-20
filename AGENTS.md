# AGENTS.md

## Project Snapshot
- Repository type: **single-project app** (not a monorepo).
- Runtime/build: **Bun + Vite + Cloudflare Workers (Wrangler)**.
- App framework: **Honox/Hono** with server routes and client islands.
- Data layer: **Cloudflare D1 + Drizzle ORM** (`app/lib/server/db/**`, `migrations/**`).
- Styling: **Tailwind CSS v4** + CSS variables in `app/style.css`.
- This root file is intentionally lightweight; read nearest AGENTS files for local rules.

## Root Setup Commands (Bun)
```bash
bun install
bun run dev
bun run build
bun run typecheck
bun run db:migrate:local
bun run db:seed:local
bun run build && bunx wrangler dev
bun run build && bunx wrangler deploy
```

## Universal Conventions
- Use TypeScript strict mode (`"strict": true`), see `tsconfig.json`.
- Use `@/*` alias for app imports (maps to `app/*`).
- Keep route modules thin; move reusable logic to `app/lib/**`.
- Use Tailwind v4 opacity syntax (`bg-black/50`), never legacy `bg-opacity-*`.
- Commit messages must follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, etc.).

## Security & Secrets
- Never commit secrets/tokens in source, fixtures, or docs.
- Put local secrets in `.dev.vars` / Wrangler-local config, not git-tracked files.
- Session/auth cookies are handled server-side; keep `httpOnly` semantics intact.
- Avoid logging sensitive auth payloads or raw credentials.

## JIT Index (what to open, not what to paste)

### Directory Map
- App-wide architecture: `app/` → [app/AGENTS.md](app/AGENTS.md)
- API routes and server rules: `app/routes/api/` → [app/routes/api/AGENTS.md](app/routes/api/AGENTS.md)
- LMS interactive UI islands: `app/islands/lms/` → [app/islands/lms/AGENTS.md](app/islands/lms/AGENTS.md)
- UI primitives/design system: `app/components/ui/` → [app/components/ui/AGENTS.md](app/components/ui/AGENTS.md)
- DB schema/mappers/repos: `app/lib/server/db/` (Drizzle + D1)
- SQL migrations/seeds: `migrations/`

### Quick Find Commands
```bash
# Find server routes
rg -n "createRoute" app/routes

# Find API auth guards
rg -n "requireAuth|requireAdmin" app/routes/api app/lib/server

# Find D1/Drizzle integration points
rg -n "drizzle|LMS_DB|getDb\(" app/lib/server/db app/lib/server

# Find LMS pages/hooks
rg -n "export default function|export function use" app/islands/lms

# Find UI primitives and variants
rg -n "type Variant|class=|cn\(" app/components/ui
```

## Definition of Done
- Typecheck passes: `bun run typecheck`.
- Production build passes: `bun run build`.
- Local DB migrations/seeds applied when changing schema/data assumptions.
- For API/frontend changes, run manual smoke checks in dev (`bun run dev`).
- Updated/added AGENTS docs when introducing new architectural patterns.
