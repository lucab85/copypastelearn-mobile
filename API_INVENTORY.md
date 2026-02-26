# API Inventory — CopyPasteLearn

## Existing Web API Routes

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

## New Mobile REST API Routes

All routes at `/api/mobile/*`. Auth via `Authorization: Bearer <Clerk JWT>`.

| Method | Path | Auth Required | Request | Response | Description |
|--------|------|--------------|---------|----------|-------------|
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
