# DBCapibara — Architecture & Skills Reference

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Language | TypeScript (strict) | 5 |
| Styling | Tailwind CSS | 4 |
| State | Zustand | 5 |
| Forms | React Hook Form + Zod | latest |
| Canvas/Diagram | @xyflow/react | 12 |
| UI Components | Radix UI + shadcn/ui | — |
| Testing | Vitest + @testing-library/react | 2 |
| Package manager | pnpm | — |

---

## Architecture: Feature-Sliced Design (FSD)

```
src/
├── app/          # Next.js App Router pages and layouts
├── pages/        # Page-level components
├── widgets/      # Composite UI blocks (e.g. DiagramCanvas, JsonEditor)
├── features/     # User-facing interactions (e.g. modeling-solution, table-connect)
├── entities/     # Domain models and their UI (e.g. table, solution)
└── shared/       # Utilities, UI primitives, design tokens
```

### Path aliases
- `@/*` → project root
- `@fsd/*` → `src/`

### Layer rules
- Each layer can only import from layers **below** it
- `shared` has no internal imports from other FSD layers
- Cross-entity imports are forbidden — go through `features` or `widgets`

---

## Key Domain Concepts

### Solution / Canvas
The core domain. A `Solution` contains `nodes` (tables) and `edges` (relationships).  
State is managed in `useSolutionStore` (Zustand) and persisted to localStorage via `canvas-storage`.

### Table Node (`entities/table`)
Each table is a canvas node with a list of `Column` objects.

```ts
export type ColumnType =
  | "PRIMARY_KEY"
  | "FOREIGN_KEY"
  | "FOREIGN_KEY_ARRAY"
  | (string & {}); // free-form user types (VARCHAR, INT, etc.)

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
}
```

**FK column rules (closed type)**:
- `FOREIGN_KEY` and `FOREIGN_KEY_ARRAY` are the only valid types for FK columns
- FK columns can only toggle between these two — never to another type
- FK columns do not expose Edit or Delete options

### Column Type Labels
Centralized in `src/entities/table/lib/column-type-labels.ts`:

| Internal type | Display label |
|---|---|
| `PRIMARY_KEY` | `PK` |
| `FOREIGN_KEY` | `FK` |
| `FOREIGN_KEY_ARRAY` | `FK[]` |
| anything else | raw string |

---

## Testing Setup

- **Runner**: Vitest 2 with jsdom environment
- **Config**: `vitest.config.ts` (root) + `vitest.setup.ts` (jest-dom setup)
- **Pattern**: `*.test.ts` / `*.test.tsx` co-located with the source file
- **Strict TDD**: active — new logic must have tests

```
src/entities/table/lib/column-type-labels.test.ts
src/entities/table/ui/attribute-node.test.tsx
src/features/modeling-solution/model/use-toggle-fk-array.test.ts
src/widgets/json-editor/lib/canvas-schema.test.ts
```

Run all tests: `npx vitest run`

---

## Installed Skills & When to Use Them

Skills are agent instructions loaded on demand. Match by task context.

### Styling & UI

| Skill | Source | When to use |
|---|---|---|
| `tailwind-v4-shadcn` | secondsky/claude-skills | **Primary** — Tailwind 4 + shadcn/ui patterns together. Use this first for any styling work. |
| `tailwind-css-patterns` | giuseppe-trisciuoglio/developer-kit | Additional Tailwind utility patterns, class composition, responsive design. |
| `shadcn` | shadcn/ui | Official shadcn/ui component patterns, installation, customization. |
| `frontend-design` | anthropics/skills | Visual design decisions, layout, component aesthetics. |

### React & Components

| Skill | Source | When to use |
|---|---|---|
| `react-best-practices` | vercel-labs/agent-skills | React 19 patterns, hooks rules, performance, React Compiler awareness. |
| `composition-patterns` | vercel-labs/agent-skills | Component composition, compound components, render props, slots. |
| `react-hook-form` | pproenca/dot-skills | Any form with `useForm`, validation wiring, field arrays. |

### TypeScript

| Skill | Source | When to use |
|---|---|---|
| `typescript-advanced-types` | wshobson/agents | Complex generics, conditional types, mapped types, inference patterns. |
| `zod` | pproenca/dot-skills | Schema definition, validation, `z.infer<>`, Zod + RHF integration. |

### Next.js & Deployment

| Skill | Source | When to use |
|---|---|---|
| `next-best-practices` | vercel-labs/next-skills | App Router patterns, Server vs Client components, data fetching. |
| `next-cache-components` | vercel-labs/next-skills | Caching strategy, `revalidate`, static vs dynamic rendering. |
| `next-upgrade` | vercel-labs/next-skills | Migrating between Next.js versions, breaking changes. |
| `deploy-to-vercel` | vercel-labs/agent-skills | Vercel deployment, env vars, preview URLs, build config. |

### Testing & Tooling

| Skill | Source | When to use |
|---|---|---|
| `vitest` | antfu/skills | Vitest config, matchers, mocking, coverage setup. |
| `vite` | antfu/skills | Vite config, plugins, aliasing, bundler optimization. |

### Backend & Node

| Skill | Source | When to use |
|---|---|---|
| `nodejs-best-practices` | sickn33/antigravity-awesome-skills | Node.js patterns, async, error handling, security. |
| `nodejs-backend-patterns` | wshobson/agents | API design, middleware, service layer patterns. |

### Quality

| Skill | Source | When to use |
|---|---|---|
| `accessibility` | addyosmani/web-quality-skills | ARIA, keyboard navigation, screen reader support, WCAG. |
| `seo` | addyosmani/web-quality-skills | Metadata, Open Graph, structured data, Core Web Vitals. |

---

## Skill Priority Rules

When multiple skills could apply, use this priority order:

1. **Tailwind + shadcn together** → `tailwind-v4-shadcn` (covers both, most specific)
2. **Forms** → `react-hook-form` + `zod` (always pair these two)
3. **New React component** → `react-best-practices` + `composition-patterns`
4. **Next.js routing/data** → `next-best-practices`
5. **TypeScript types** → `typescript-advanced-types` only for complex type gymnastics

---

## Conventions

- **Co-locate tests** with the source file they test
- **No barrel re-exports** from `features` into `entities` (FSD rule)
- **FK columns are a closed type** — only `FOREIGN_KEY` ↔ `FOREIGN_KEY_ARRAY`
- **structuredClone** before mutating nodes in Zustand store (required for reactivity)
- **`useShallow`** from zustand when selecting multiple store slices
- Commits follow **conventional commits**: `feat:`, `fix:`, `test:`, `chore:`, `docs:`
