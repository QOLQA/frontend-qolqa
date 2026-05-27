# Code Review Rules

## Architecture
- Follow Feature-Sliced Design (FSD): app / pages / widgets / features / entities / shared
- Each layer can only import from layers below it
- No cross-entity imports — route through features or widgets
- Path aliases: `@fsd/*` → `src/`, `@/*` → root

## TypeScript
- Strict mode is required — no `any`, no `as unknown as X` without justification
- Prefer type aliases for domain types (e.g. `ColumnType`)
- Use `(string & {})` escape hatch only when a union needs to remain open for user-defined values
- `useShallow` from zustand when selecting multiple store slices

## React
- Use functional components with named exports
- No `useMemo` / `useCallback` unless React Compiler is not handling it (React 19)
- `React.memo` only for components proven to re-render unnecessarily
- Co-locate state as close to usage as possible

## State (Zustand)
- Always `structuredClone` before mutating node data in the store
- Use `useShallow` for multi-slice selectors
- No direct store mutation outside of store actions

## Styling
- Tailwind CSS 4 utility classes only — no inline styles
- Use `cn()` for conditional class merging
- shadcn/ui components are the base — extend, don't override internals

## Forms
- React Hook Form + Zod for all forms
- Define Zod schema first, infer TypeScript type from it

## Testing
- Co-locate test files with the source (`*.test.ts` / `*.test.tsx`)
- Pure logic → plain Vitest
- React components → `@testing-library/react` with jsdom
- No test should rely on implementation details — test behavior, not internals
- FK columns are a closed type: only `FOREIGN_KEY` ↔ `FOREIGN_KEY_ARRAY`

## Commits
- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- Each commit must be atomic and buildable on its own
- No AI attribution in commit messages

## General
- No commented-out code
- No console.log in production code
- Prefer explicit over implicit
