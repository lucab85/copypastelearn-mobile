## Tasks

### 1. Backend: Add cursor pagination to `/api/mobile/courses`
- [ ] Update `apps/web/src/app/api/mobile/courses/route.ts` to accept `cursor` and `limit` query params
- [ ] Return `{ success: true, data: CourseListItem[], nextCursor: string | null }`
- [ ] Default limit: 20, max limit: 50

### 2. Mobile: Add pagination types
- [ ] Add `PaginatedResponse<T>` type to `src/services/types.ts`
- [ ] Update `apiClient.ts` with `getCoursesPaginated(cursor?, limit?)` method

### 3. Mobile: Create skeleton components
- [ ] Create `src/components/SkeletonBox.tsx` — animated shimmer base component (Animated API, opacity 0.3↔0.7)
- [ ] Create `src/components/SkeletonCourseCard.tsx` — matches CourseCard layout
- [ ] Create `src/components/SkeletonLessonRow.tsx` — matches lesson list row
- [ ] Create `src/components/SkeletonDashboard.tsx` — matches dashboard layout

### 4. Mobile: Refactor catalog with infinite scroll
- [ ] Replace `useQuery` with `useInfiniteQuery` in `app/(tabs)/catalog/index.tsx`
- [ ] Use `FlatList` with `onEndReached` → `fetchNextPage`
- [ ] Show `SkeletonCourseCard` × 4 during initial load
- [ ] Show small `ActivityIndicator` at bottom while fetching next page
- [ ] Add `refreshControl` for pull-to-refresh

### 5. Mobile: Improve search
- [ ] Use `useDebouncedCallback` (300ms) for search text filtering
- [ ] Add empty state component with icon + "No courses found" + clear button
- [ ] Add `accessibilityLabel="Search courses"` and `accessibilityHint="Type to filter courses by title"`

### 6. Mobile: Add progress indicators
- [ ] Create `src/components/ProgressBar.tsx` — thin bar component (blue in-progress, green complete)
- [ ] Add progress bar to course cards in catalog list
- [ ] Add completion checkmarks to lesson rows in course detail
- [ ] Show video position ("12:34 / 20:00") for in-progress lessons

### 7. Mobile: Dashboard pull-to-refresh + skeletons
- [ ] Add `RefreshControl` to dashboard `ScrollView`
- [ ] Replace spinner with `SkeletonDashboard` during initial load

### 8. Tests
- [ ] Add test for `SkeletonBox` animation (renders without crash)
- [ ] Add test for debounced search filtering logic
- [ ] Add test for pagination cursor parsing

### 9. Commit and push
- [ ] Commit all changes with descriptive message
- [ ] Push to GitHub
