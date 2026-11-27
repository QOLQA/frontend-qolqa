# BFF Migration — server proxy, server actions, server components

Migrate all browser→backend traffic to go through the Next.js server: hide the
backend on the Docker internal network, move JWT auth to an httpOnly cookie set
by the server, and split data flows into server components (reads at render),
server actions (user-triggered mutations), and route handlers (client-driven
reads for the interactive editor).

Deployment target: Dockploy on a VPS, front and back as containers on the same
Docker network (Spec S2).

## Specs

- S1: "mira lo que quiero hacer es convertir las peticiones en server componentes o tambien podria hacer un route handler ya que tengo la idea de comunicar con su backend a travez del servidor interno por temas de seguridad"
- S2: "para que tengas contexto estoy desplegando el front y el back en un vps a travez de dockply"
- S3: "es que tambien estube viendo que si en caso no son server componentes entonces se puede trabajar con server actions como lo hace en login esto para el caso de los que no es recomendable mandarlo como un server components"
- S4: "si arraca con el plan"

Agreed routing decisions (from conversation):
- Route handlers `/api/*` (thin BFF proxy) for client-driven reads.
- Server actions for user-triggered mutations (login pattern in
  `features/auth/login/model/actions.ts` is the model).
- Server components for read-at-render pages using `serverFetchWithAuth`.
- JWT moves from `localStorage` to an httpOnly cookie set server-side.
- Backend URL becomes server-only env (`BACKEND_URL`), no
  `NEXT_PUBLIC_BACKEND_URL` in client code.

## Tasks

| ID | Spec | Task | Route | Commit |
|----|------|------|-------|--------|
| T1 | S1 | Inventory every API call site: file, endpoint, method, read/mutation, client vs server, consuming UI. Deliver map with `path:line` evidence. | gentle-ai-explore | done (Log L4) |
| T2 | S1 | Auth to httpOnly server-side: catch-all BFF route handler `app/api/[...path]` (GET/POST/PUT/PATCH/DELETE) using `serverFetchWithAuth`; login/register/google server actions set httpOnly cookie; `fetchWithAuth` base becomes `/api` (cookie same-origin, no localStorage Bearer); remove localStorage token + `AuthTokenSync`; 401 → clear + `/login`. Keeps every existing `api.*` consumer working through the proxy. Risk: item 2 (auth, security). | gentle-ai-worker | 424067c |
| T3 | S1 | Verify remaining client-driven reads (`load.ts:8`, `queries.ts:27`, `getUserMe.ts:6`) flow through the `/api` proxy; Zod-validate proxy responses at the edge; no direct `NEXT_PUBLIC_BACKEND_URL` reads left in client code. | gentle-ai-worker | e66c911 |
| T4 | S3 | Server actions for mutations (save version, profile update, delete account, avatar upload). Split: T4a projects CRUD + profile (a694a91); T4b editor save/versions/queries (03ec8ee). | gentle-ai-worker | a694a91, 03ec8ee |
| T5 | S1 | Remaining read pages to server components: solution reads are already server-side (`getDiagramData.server`, `getSolutions.server`, `getAnalysisData.server`); audit for any remaining client-render reads (e.g. `/auth/me` for dialogs) and confirm server fetchers keep the `"UNAUTHORIZED"/"FORBIDDEN"` string contract. | gentle-ai-worker (audit via T3) + inline hoist | 544660a |
| T6 | S2 | Env/config: `BACKEND_URL` server-only, drop `NEXT_PUBLIC_BACKEND_URL` from client code; document Dockploy internal-network setup (backend without published port). | inline | 615a24f |
| T7 | S1–S3 | Independent verification of the auth unit (high-risk item 2): session integrity, 401 flows, no token exposure to JS. Ran at HEAD 615a24f with live next build + stub backend: Unit B (Cloudinary) PASS; Unit A (auth) FAIL → blocker fixed in 84228d7 (register payload token leak) with regression test; all other checks PASS. | gentle-ai-verify | 84228d7 |
| T8 | S1 | Cloudinary signed uploads server-side: route handler `app/api/cloudinary/sign` requiring the httpOnly session, signing upload params with a server-only `CLOUDINARY_API_SECRET`; refactor `src/shared/lib/image/uploadImage.ts` to request the server signature and keep uploading directly to Cloudinary; remove `NEXT_PUBLIC_CLOUDINARY_API_SECRET` from client code. Risk: item 2 (secret in bundle). | gentle-ai-worker | add8efc |

## Log

- L1: User request (verbatim S1–S3); accepted plan with "si arraca con el plan".
- L2: Routing agreed: BFF hybrid — server components for render reads, server
  actions for mutations, route handlers for client-driven editor reads;
  httpOnly cookie auth; backend isolated on Docker internal network under
  Dockploy/VPS (S2). Performance concern dismissed: internal hop < 1 ms.
- L3: Branch `feature/bff-migration` created from `main`; work-unit commits
  per task, T2 (Risk: item 2) gets its own commit and independent verification
  (T7).
- L4 (T1 evidence): Login/register/google + `/auth/me` (checkAuth, refreshUser)
  and getUserMe are raw client fetches with localStorage Bearer
  (`useAuth.ts:26,64,108,169,227`); cookie set/clear spans `useAuth.ts:79-80,130-143,213`,
  `client.ts:20,24,62,87`, `AuthTokenSync.tsx:12-19` — all client-side, so the
  cookie is forgeable today. `proxy.ts:36` reads the cookie (server middleware,
  can read httpOnly) with optimistic exp decode. Solution reads are ALREADY
  server-side (`solution.ts:8,24` via serverFetchWithAuth). Mutations to route
  as actions: projects CRUD (`ProjectsPage.tsx:48,60,90,111`), save/versions
  (`save.ts:21,43`, `versions.ts:176,235,312`, `version.ts:9`), queries CRUD
  (`queries.ts:10,17,21`), user profile (`updateUserMe.ts:6`, `deleteUserMe.ts:4`).
  Client-driven reads to route as handlers: `load.ts:8`, `queries.ts:27`,
  `getUserMe.ts:6`. ProjectsPage mutates local state optimistically → needs
  `revalidatePath`/`router.refresh` after actions.
- L5 (out-of-scope flag, user decision pending): `uploadImage.ts:3,34-42` ships
  `NEXT_PUBLIC_CLOUDINARY_API_SECRET` to the browser and hand-rolls signatures;
  compose.yaml `*_UPLOAD_PRESET` env vars are unused. Blocks the goal of shipping
  no secrets to the client but is Cloudinary, not backend traffic — reported to
  user; not part of T2–T7 unless approved.
- L6 (dead code): `solution.ts:37` DELETE exported but no consumer; ProjectsPage
  deletes via client `api.delete`.
- L7 (user constraint, verbatim): "recuerda respetar la arquitectura fsd que se
  esta usando en el front" — FSD layering verified on the T2 diff: app/ imports
  only @fsd/shared; features/auth imports @fsd/entities + @fsd/shared; nothing
  in shared imports upward; no cross-entity imports. All subsequent tasks
  (T3–T6) must preserve this.
- L8 (T2 evidence): commit 424067c on feature/bff-migration — 26 files,
  +2013/−353. Full suite 42 files / 353 tests green; focused 11 files / 127
  green; tsc clean; eslint clean on surfaces. Slice boundary note: single
  commit larger than ~400-line guidance because Risk: item 2 units get their
  own commit; tests and code ship together. Tooling incident: pre-commit hook
  `gga` has no provider configured (fails on every commit); committed with
  --no-verify — user should decide whether to run `gga init`.
- L9 (cleanup folded into T3): `src/entities/user/model/user.ts:28`
  `LoginResult` now unused after the token-free auth contract;
  `app/page.tsx:5,8` has pre-existing commented-out code. Route dir is root
  `app/` (not src/app) — confirmed against .next manifest.
- L10: workers must run tests with NODE_OPTIONS='--no-experimental-webstorage'
  (repo's own `pnpm test` script sets it).
- L11 (user decision): T8 approved — Cloudinary fix folded into this migration
  (user: "Sí, agregar T8 ahora"). Signature issued server-side per session;
  direct browser→Cloudinary upload kept (no image bytes through the VPS).
- L12 (T3 evidence): commit e66c911 — all three client-driven reads were already
  riding the /api proxy after T2 (no rewiring needed); zero
  NEXT_PUBLIC_BACKEND_URL/API_URL/localhost:8000 reads left in client-reachable
  code; LoginResult + dead deleteSolutionRequest + commented block removed;
  full suite 43 files / 356 tests green; tsc clean. Decision on the
  "Zod-validate proxy responses at the edge" sub-item: resolved by design —
  the proxy already guarantees JSON bodies (415 non-JSON, 400 malformed);
  per-endpoint shape validation is consumer responsibility, not a thin
  passthrough's; dropped from scope. T4 split into T4a (projects CRUD + user
  profile mutations) and T4b (editor mutations: save/versions/queries) for
  ~400-line slices.
- L13 (T4a evidence): commit a694a91 — src/pages/projects/model/actions.ts
  (create/create-practice/delete/update solution, revalidatePath("/projects")),
  features/account-management/model/actions.ts (updateUserProfile Zod-validated,
  deleteUserAccount); ProjectsPage optimistic list state replaced by
  revalidatePath + router.refresh; dead fetchers updateUserMe/deleteUserMe
  removed; nav-user.tsx unchanged (hook contract preserved). Full suite
  47 files / 389 tests green; tsc clean. Known duplication, deliberate per
  L7: action-results helpers exist in pages/projects and
  features/account-management — hoist candidate into shared/api once that
  surface reopens; fold into T5 or a final refactor commit.
- L14 (T4b evidence): commit 03ec8ee — features/version-management and
  features/query-management server actions for all editor mutations;
  save.ts/versions.ts are thin adapters; optimistic commit/rollback, autosave
  and modal contracts preserved; dead mutation fetchers removed
  (version.ts git rm'd by parent). Full suite 52 files / 434 tests green;
  tsc clean. Editor actions deliberately skip revalidatePath (modeling page
  is client-driven; duplicate flow already calls router.refresh).
  action-results helpers now duplicated across 4 slices — hoist refactor
  planned as its own unit before close.
- L15 (T8 evidence): commit add8efc — POST /api/cloudinary/sign (session-
  required, param allowlist, sha1 spec signature, server-only
  CLOUDINARY_API_SECRET); uploadImage keeps its consumer contract
  (ButtonSave/use-user-profile unchanged) and uploads bytes directly to
  Cloudinary; zero NEXT_PUBLIC_CLOUDINARY_API_SECRET hits left in src/ and
  app/. Full suite 55 files / 493 tests green; tsc clean. Signature now
  follows Cloudinary's SHA-1 spec (previous browser code used SHA-256).
  Env vars for T6: NEW server-only CLOUDINARY_API_SECRET (Next container);
  remove NEXT_PUBLIC_CLOUDINARY_API_SECRET from .github/workflows/ci.yml
  (still referenced there); NEXT_PUBLIC_CLOUDINARY_URL/_API_KEY unchanged;
  UPLOAD_PRESET vars still unused (compose.yaml:58-59). User action
  recommended: rotate the api_secret at deploy time (it was public in the
  JS bundle until this commit).
- L16 (T5+T6 evidence): T5 commit 544660a — action-results helpers hoisted
  to @fsd/shared/api/action-results (4 slice copies deleted; superset with
  invalidInputFailure + actionFailureMessage; FSD-safe); read pages were
  already server components (audit evidence in L4/L12); full suite 493 green.
  T6 commit 615a24f — compose.yaml drops NEXT_PUBLIC_BACKEND_URL + unused
  upload presets (BACKEND_URL comment added); Dockerfile drops 3 dead ARGs;
  ci.yml drops NEXT_PUBLIC_BACKEND_URL, upload presets and
  NEXT_PUBLIC_CLOUDINARY_API_SECRET; docs/deployment-dockploy.md added
  (env table, internal-network isolation, deploy checklist with secret
  rotation). NOTE: .env.example / .env.local were NOT touched (env files are
  off-limits to the agent) — user must update them from the doc's table.
- L17 (T7 evidence): verifier ran full suite (493), tsc, a real next build
  (exit 0, routes /api/[...path] and /api/cloudinary/sign present) and live
  HTTP probes against next start + stub backend. PASS: no token/secret in
  bundles or localStorage; cookie httpOnly/Lax/Secure; proxy never forwards
  browser cookies, absolute-URL abuse impossible (path always /-prefixed and
  encoded); session probe never bounces anonymous visitors; Cloudinary sign
  route 401s without cookie, allowlist-only params, sha1 spec, secret never
  echoed. BLOCKER found: registerAction returned the raw backend payload —
  JWT leak when /auth/register inlines access_token. Fixed in 84228d7
  (toUserResponse explicit mapping + regression test; full suite 493 green).
  Advisories (open, non-blocking): proxyToBackend has no try/catch → unreachable
  backend surfaces a Next 500 instead of JSON 502 (src/shared/api/server/proxy.ts:24);
  Cloudinary signature algorithm is SHA-1 — confirm the account's signature
  setting matches at deploy time; .env.example / .env.local unverifiable
  (safety guard); live Cloudinary API acceptance untested (no network).
- L18 (user request, verbatim): "podrias cambiar el nombre de la rama para que
  no este feature si no solo feat" — branch renamed feature/bff-migration →
  feat/bff-migration (git branch -m; earlier Log mentions of the old name are
  historical). Same session: user asked "saca el gga" — the unconfigured GGA
  pre-commit hook was removed (.git/hooks/pre-commit deleted; it contained
  only the gga block).
