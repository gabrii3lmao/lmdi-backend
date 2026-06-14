# LetMeDoIt Backend

## Commands
```bash
npm run dev         # tsx watch src/index.ts
npm run build       # tsc (also copies src/assets -> dist/)
npm start           # node dist/index.js
npm test            # vitest (all .spec.ts under src/tests/)
npm run test:submissions  # vitest tests/Submissions/
npm run test:exams        # vitest tests/Exams/
npm run test:classes      # vitest tests/Classes/
docker compose up -d --build  # runs app + MongoDB 7 + Redis 7
```
No `lint` or `typecheck` script exists.

## Imports
TS files use **`.js` extensions** in relative imports (required by `nodenext` + `verbatimModuleSyntax`):
```ts
import { X } from "./Foo.service.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
```

## Architecture
- **Entrypoint:** `src/index.ts` — Express app on `PORT` (default 3000). Routes are mounted under `/api` via `src/routes/Router.ts`.
- **Modules under `src/modules/` each with:** `[Name].routes.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`, `.model.ts`, `dto/`.
- **Wiring happens in routes files** — no DI container. Pattern:
  ```ts
  const repo = new XRepository();
  const service = new XService(repo, ...);
  const controller = new XController(service, ...);
  router.use("/path", controller.method);
  ```
- **Dependencies cross modules** — e.g., `Exam.routes.ts` imports `ClassRepository`, `SubmissionRepository`, `SubmissionService`.

## Key Middleware (all in `src/middlewares/`)
- `authMiddleware` — reads JWT from `req.cookies.token` or `Authorization: Bearer <token>`. Sets `req.user.id`.
- `validate(schema, target?)` — Zod-based; `target` is `"body"` (default), `"params"`, or `"query"`.
- `globalLimiter` — 200 req / 15 min per IP using Redis store. Applied in `src/index.ts` before all routes.
- `errorMiddleware` — catches `HttpException` (from `src/config/errorHandler.ts`) or generic `Error`. Used via `next(error)`.

## Error Handling
Throw `HttpException` from services (never `res.status`). Controllers catch and call `next(error)`.

## Workers (auto-started on boot)
`src/config/workers.ts` is imported in `src/index.ts` and side-effect-imports:
- `Submission.queue.ts` — defines `process-submissions` queue + worker (concurrency 2). Processes images via Gemini AI.
- `Email.worker.ts` — defines worker for `email-queue` (sends password reset emails).
- Redis connections: Email queue exports shared `connection` (also used by rate limiter). Submission queue creates its own.

## Auth / Tokens
- `generateToken()` in `src/config/jwtService.ts` returns `{ accessToken, refreshToken }`.
- Access token: 15m expiry, `JWT_SECRET`. Refresh token: 7d expiry, `JWT_REFRESH_SECRET`.
- Login sets refresh token in `httpOnly` cookie named `refreshToken`. Signup does **not** set cookies (only returns user).

## Known Quirks
- `multer-storage-cloudinary` import has `// @ts-ignore` due to missing types.
- `.env` needs `JWT_REFRESH_SECRET` but it is absent from `.env.example`.
- `postbuild` copies `src/assets/` to `dist/` (failure is silently ignored with `|| :`).
- Test files live in `src/tests/[Module_Name]/` mirroring `src/modules/`.

## Module Routes (under `/api`)
| Prefix | Auth | File |
|---|---|---|
| `/auth` | Partial | `Users/User.routes.ts` |
| `/exams` | All routes | `Exams/Exam.routes.ts` |
| `/submissions` | All routes | `Submission/Submission.routes.ts` |
| `/classes` | Per-route | `Classes/Class.routes.ts` |
