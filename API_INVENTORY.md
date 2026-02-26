# API Inventory — CopyPasteLearn

> **Note:** The mobile API routes live on the [`feature/mobile-api`](https://github.com/lucab85/copypastelearn.com/tree/feature/mobile-api) branch of the web repo. They must be merged before the mobile app can connect.

## Web Repo Changes Required

The following files were added to `apps/web/src/app/api/mobile/` on branch `feature/mobile-api`:

| File | Endpoint |
|------|----------|
| `_lib/auth.ts` | Shared error handling helper |
| `courses/route.ts` | `GET /api/mobile/courses` |
| `courses/[slug]/route.ts` | `GET /api/mobile/courses/[slug]` |
| `courses/[slug]/lessons/[lessonSlug]/route.ts` | `GET /api/mobile/courses/[slug]/lessons/[lessonSlug]` |
| `dashboard/route.ts` | `GET /api/mobile/dashboard` |
| `me/route.ts` | `GET /api/mobile/me` |
| `progress/position/route.ts` | `POST /api/mobile/progress/position` |
| `progress/complete/route.ts` | `POST /api/mobile/progress/complete` |
| `mux/tokens/[playbackId]/route.ts` | `GET /api/mobile/mux/tokens/[playbackId]` |

Additionally, `src/middleware.ts` was updated to add `/api/mobile(.*)` to public routes (Clerk middleware still attaches auth, but doesn't block unauthenticated requests).

## Existing Web API Routes (default branch)

| Method | Path | Auth | Used by Mobile | Description |
|--------|------|------|----------------|-------------|
| POST | `/api/webhooks/clerk` | Clerk webhook signature | ❌ | Syncs Clerk user events to DB |
| POST | `/api/webhooks/stripe` | Stripe webhook signature | ❌ | Handles subscription lifecycle |
| POST | `/api/billing/portal` | Clerk session | ❌ | Creates Stripe billing portal session |

## Existing Server Actions (not callable from mobile)

| Function | File | Description |
|----------|------|-------------|
| `getCourses()` | `server/queries/courses.ts` | List published courses with optional user progress |
| `getCourse(slug)` | `server/queries/courses.ts` | Course detail with ordered lessons |
| `getLesson(courseSlug, lessonSlug)` | `server/queries/lessons.ts` | Full lesson content with access gating |
| `getDashboard()` | `server/queries/dashboard.ts` | Dashboard: in-progress courses, recent lessons |
| `saveVideoPosition(lessonId, pos)` | `server/actions/progress.ts` | Save video playback position |
| `markLessonComplete(lessonId)` | `server/actions/progress.ts` | Mark lesson complete, recalc course % |

## New Mobile REST API Routes (branch: `feature/mobile-api`)

All routes at `/api/mobile/*`. Auth via `Authorization: Bearer <Clerk JWT>`.

| Method | Path | Auth Required | Request | Response | Description |
|--------|------|--------------|---------|----------|-------------|
| GET | `/api/mobile/me` | ✅ | — | `UserProfile` | Verify token + get profile/entitlements |
| GET | `/api/mobile/courses` | Optional | — | `CourseListItem[]` | List published courses |
| GET | `/api/mobile/courses/[slug]` | Optional | — | `CourseDetail` | Course with lesson list |
| GET | `/api/mobile/courses/[slug]/lessons/[lessonSlug]` | Conditional* | — | `LessonDetail` | Lesson detail + video playback ID |
| GET | `/api/mobile/dashboard` | ✅ | — | `DashboardData` | User's learning dashboard |
| POST | `/api/mobile/progress/position` | ✅ | `{lessonId, positionSeconds}` | `{success}` | Save video position |
| POST | `/api/mobile/progress/complete` | ✅ | `{lessonId}` | `{success, percentComplete}` | Mark lesson complete |
| GET | `/api/mobile/mux/tokens/[playbackId]` | ✅ | — | `MuxTokensResponse` | Get signed Mux playback tokens |

*First lesson (sortOrder=0) is free; others require active subscription.

## Authentication Flow

1. Mobile app uses `@clerk/clerk-expo` for sign-in
2. Clerk SDK provides JWT via `getToken()`
3. Mobile sends `Authorization: Bearer <token>` on all API requests
4. Backend validates via Clerk middleware (same tenant as web)
5. `getCurrentUser()` / `requireAuth()` resolve the DB user from Clerk ID
6. On 401/403 response, mobile auto-signs-out and redirects to sign-in

## Data Types

All response types are defined in `packages/shared/src/types/course.ts` and mirrored in the mobile app at `src/services/types.ts`.

Responses follow the pattern:
```json
{
  "success": true,
  "data": { ... }
}
```

Errors:
```json
{
  "error": {
    "code": "UNAUTHORIZED|FORBIDDEN|NOT_FOUND|BAD_REQUEST|INTERNAL",
    "message": "Human-readable message"
  }
}
```
