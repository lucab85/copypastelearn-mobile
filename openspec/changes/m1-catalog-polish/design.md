## Context

The CopyPasteLearn mobile app (Expo/React Native) has a working M0 scaffold with basic catalog browsing, course detail, and video playback. The catalog currently loads all courses in a single API call with a simple spinner, and search triggers on every keystroke. The app needs production-level UX: pagination, skeletons, pull-to-refresh, and visual progress tracking.

The backend is a Next.js app with Prisma/PostgreSQL. The `/api/mobile/courses` endpoint currently returns all published courses. We need to extend it with cursor-based pagination.

## Goals / Non-Goals

**Goals:**
- Smooth infinite scroll with cursor-based pagination (20 items per page)
- Shimmer skeleton placeholders that match the layout of real content
- Debounced search (300ms) with empty state UI
- Pull-to-refresh on catalog and dashboard
- Visual progress indicators on course cards and detail screen

**Non-Goals:**
- Server-side search (still client-side filter for MVP; server search is M3+)
- Category/tag filtering (deferred — backend doesn't have category taxonomy yet)
- Offline caching or search history persistence
- Animated transitions between screens

## Decisions

### 1. Cursor-based pagination over offset-based
**Choice:** Use cursor pagination (`?cursor=<lastId>&limit=20`)
**Why:** More reliable with changing data (new courses added), no skipped/duplicated items. TanStack Query's `useInfiniteQuery` supports cursor pagination natively.
**Alternative:** Offset-based (`?page=1&limit=20`) — simpler but breaks if data changes between pages.

### 2. Client-side search (debounced) over server-side
**Choice:** Filter the already-fetched pages client-side with 300ms debounce.
**Why:** Course catalog is small (<100 courses). Avoids additional API complexity. Search is instant after first load.
**Alternative:** Server-side search endpoint — premature for current catalog size.

### 3. Shimmer skeletons as reusable components
**Choice:** Create `SkeletonCourseCard`, `SkeletonLessonRow`, `SkeletonDashboard` components using animated `Animated.View` with opacity pulse.
**Why:** Native Animated API works in Expo Go. No external skeleton library needed.
**Alternative:** `react-native-skeleton-placeholder` — adds dependency, may have Expo Go compatibility issues.

### 4. `useInfiniteQuery` for pagination
**Choice:** TanStack Query's `useInfiniteQuery` with `getNextPageParam` from API cursor response.
**Why:** Built-in support for infinite scroll, automatic page management, caching across pages.

## Risks / Trade-offs

- [Client search won't scale] → Acceptable for <100 courses; revisit if catalog grows past 200
- [Skeleton layout mismatch] → Keep skeleton dimensions synced with real card styles via shared constants
- [Pagination cursor format] → Backend returns `nextCursor: string | null`; if course is deleted mid-scroll, cursor still works (Prisma cursor is id-based)
