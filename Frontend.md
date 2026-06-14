# Frontend — Pagination Implementation

## Backend API Contract

All paginated endpoints accept `?page=1&limit=10` (defaults: page=1, limit=10, max limit=100) and return:

```ts
{
  data: T[],
  totalItems: number,
  totalPages: number,
  currentPage: number
}
```

| Endpoint | Module | Notes |
|---|---|---|
| `GET /api/classes` | Classes | Authenticated |
| `GET /api/submissions?examId=xxx` | Submissions | Authenticated |
| `GET /api/submissions/class/:classId` | Submissions | Authenticated |
| `GET /api/exams/class/:classId` | Exams | Authenticated |

## Steps

### 1. Add shared type

**`src/types/Pagination.ts`**
```ts
export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
```

### 2. Update services to accept pagination params

**`src/services/turmas.ts`** — add `page?` and `limit?` to `getAll`:
```ts
getAll: (page?: number, limit?: number) =>
  api.get("/classes", { params: { page, limit } }),
```

**`src/services/examService.ts`** — add `page?` and `limit?` to `listarGabaritosMestre`:
```ts
listarGabaritosMestre: (classId: string, page?: number, limit?: number) =>
  api.get(`/exams/class/${classId}`, { params: { page, limit } }),
```

**`src/services/submissionService.ts`** — add `page?` and `limit?` to `getAllSubmission` and `getSubmissionsByClass`:
```ts
getAllSubmission: (examId: string, page?: number, limit?: number) =>
  api.get("/submissions", { params: { examId, page, limit } }),
getSubmissionsByClass: (classId: string, page?: number, limit?: number) =>
  api.get(`/submissions/class/${classId}`, { params: { page, limit } }),
```

### 3. Update views to handle paginated response

Every view currently expects `response.data` to be the array directly. Since paginated endpoints now return `{ data, totalItems, totalPages, currentPage }`, update each `queryFn` to unwrap.

#### 3a. `src/views/TurmasDashboard.vue`
- Change `queryFn` to access `data.data` (nested)
- Add local `page`/`limit` reactive refs
- Add pagination controls below the card grid
- Re-fetch on page change via `refetch()` or by including page/limit in `queryKey`
- Show "totalPages" info

#### 3b. `src/views/Submissoes.vue`
- Update submissions query to pass page/limit
- Store pagination state locally
- Add pagination controls below `SubmissionTable`
- The `averageScore` and submission count should reflect the **total** (from `totalItems`), not just the current page

#### 3c. `src/views/Turma.vue`
- Handled via `useExams` composable (see below)
- Add pagination controls in the template for submissions

#### 3d. `src/views/Gabaritos.vue`
- The `useGabaritos` composable fetches all exams across all classes (one request per class). Adding pagination here is complex because data is aggregated from multiple requests.
- **Option A (recommended):** Keep this view as-is (no pagination for the "all templates" view, since the data is already split by class) or add client-side pagination.
- **Option B:** Change the composable to paginate per-class and aggregate. More complex.

### 4. Update composables

#### 4a. `src/composables/useExams.ts`
- The submissions query should accept page/limit
- Expose `page`, `limit`, `totalPages`, `totalItems` for the template
- Keep polling logic (`refetchInterval`) — the paginated response still contains the `data` array with submission statuses

#### 4b. `src/composables/useGabaritos.ts`
- The "todos-gabaritos" query aggregates exams from all classes. For now, skip server-side pagination here or add a `page`/`limit` to each per-class request and aggregate results.

### 5. Add pagination UI component

Create **`src/components/common/Pagination.vue`** (reusable):

Props: `currentPage`, `totalPages`, `totalItems`
Emits: `page-change`

Template: "Previous" / page buttons / "Next", with TailwindCSS styling to match the existing UI. Show "Página X de Y (Z registros)".

Use a simple numbered approach (show first, last, and 2-3 pages around current).

### 6. Update SubmissionTable

**`src/components/Submissions/SubmissionTable.vue`**
- Add the `Pagination` component below the table
- Current props are fine, just pass pagination state from parent

### 7. Update component specs

If there are test files under `src/**/__tests__/*`, update them to match the new paginated response shape.

## Order of Implementation

1. `src/types/Pagination.ts`
2. `src/components/common/Pagination.vue`
3. Three services: `turmas.ts`, `examService.ts`, `submissionService.ts`
4. Composable: `useExams.ts`
5. Views: `TurmasDashboard.vue` → `Submissoes.vue` → `Turma.vue`
6. Composable: `useGabaritos.ts` (if adding pagination)
7. `Gabaritos.vue` (if adding pagination)

## Notes
- TanStack Vue Query will re-fetch automatically when params (page/limit) in the `queryKey` change. Include them in the key: `queryKey: ["turmas", page, limit]`.
- Axios ignores params that are `undefined`, so passing `api.get("/classes", { params: { page: undefined, limit: undefined })` is safe and won't send them in the URL.
- The `useExams` composable uses a polling `refetchInterval` of 3s when pending submissions exist. Update the query key to include page/limit so polling still works.
