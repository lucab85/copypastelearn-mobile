## Why

The M0 scaffold delivers basic catalog browsing, but it lacks the polish users expect from a production mobile app. The course list has no pagination (loads all courses at once), no loading skeletons (shows a spinner), and basic search with no debouncing. Course detail is functional but doesn't communicate progress visually. These gaps make the app feel like a prototype rather than a product.

## What Changes

- Add cursor-based pagination to the catalog list with infinite scroll
- Replace ActivityIndicator spinners with shimmer/skeleton loading placeholders
- Add debounced search with "no results" empty state and search history
- Add pull-to-refresh on catalog and dashboard screens
- Add course progress indicators (progress bar, lesson count badges) to list items and detail
- Add category/tag filtering chips on catalog
- Improve course detail layout with collapsible lesson sections and completion checkmarks

## Capabilities

### New Capabilities
- `catalog-pagination`: Infinite scroll with cursor-based pagination for course list
- `loading-skeletons`: Shimmer placeholder components for courses, lessons, and dashboard
- `search-improvements`: Debounced search input, empty states, and search suggestions
- `pull-to-refresh`: Pull-to-refresh gesture on catalog and dashboard screens
- `progress-indicators`: Visual progress bars and completion badges on course cards and detail

### Modified Capabilities

## Impact

- `app/(tabs)/catalog/index.tsx` — pagination, search, skeletons, pull-to-refresh
- `app/(tabs)/catalog/[slug].tsx` — progress indicators, collapsible sections
- `app/(tabs)/index.tsx` — skeletons, pull-to-refresh
- `src/services/apiClient.ts` — paginated course fetching
- `src/services/types.ts` — pagination cursor types
- Backend: `/api/mobile/courses` needs optional `cursor` + `limit` query params
