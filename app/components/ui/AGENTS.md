# AGENTS.md — app/components/ui/

## Package Identity
- `app/components/ui/` contains reusable UI primitives (button, dialog, select, tabs, toast, etc.).
- Components are Hono JSX-based and styled with Tailwind CSS v4 + CSS variables.

## Setup & Run (Bun)
```bash
bun run dev
bun run build
bunx tsc --noEmit
```

## Design System / Conventions
- ✅ **DO** keep primitives stateless/composable and pass through intrinsic element props (example: `button.tsx`).
- ✅ **DO** centralize class composition with `cn(...)` (example: `button.tsx`).
- ✅ **DO** use semantic tokens (`hsl(var(--...))`) over hardcoded colors (examples: `button.tsx`, `card.tsx`).
- ✅ **DO** follow Tailwind v4 opacity syntax like `bg-black/90` (example: `button.tsx`).
- ✅ **DO** register interactive UI controllers in renderer (`app/routes/_renderer.tsx`) when adding new controller islands.
- ❌ **DON'T** use legacy Tailwind opacity classes (`bg-opacity-*`, `text-opacity-*`).
- ❌ **DON'T** bypass shared primitives from feature code if an equivalent component already exists.

## Touch Points / Key Files
- Button variant/size baseline: `app/components/ui/button.tsx`
- Dialog primitive contracts: `app/components/ui/dialog.tsx`
- Dropdown primitive contracts: `app/components/ui/dropdown-menu.tsx`
- Toast rendering and variants: `app/components/ui/toast.tsx`
- Runtime controller mounts: `app/routes/_renderer.tsx`
- Controller implementations: `app/islands/ui/*-controller.tsx`

## JIT Index Hints
```bash
# Find all UI primitive exports
rg -n "export function|export type" app/components/ui

# Find tokenized color usage
rg -n "hsl\(var\(--" app/components/ui app/style.css

# Find interactive controller dependencies
rg -n "data-ui-|controller" app/components/ui app/islands/ui app/routes/_renderer.tsx
```

## Common Gotchas
- Use `class` prop (Hono JSX), not `className`.
- For interactive primitives, make sure the corresponding island controller exists and is mounted.
- Keep ARIA/data attributes stable; controller logic depends on them.

## Pre-PR Checks
```bash
bunx tsc --noEmit && bun run build
```
