## Tasks

### 1. Install @react-native-community/netinfo
- [ ] `npm install @react-native-community/netinfo --legacy-peer-deps`

### 2. Create ErrorBoundary component
- [ ] Create `src/components/ErrorBoundary.tsx` — class component with getDerivedStateFromError
- [ ] Show "Something went wrong" with emoji + "Restart" button
- [ ] Reset state on restart, re-render children
- [ ] Wrap app in _layout.tsx

### 3. Create OfflineBanner component
- [ ] Create `src/hooks/useNetworkState.ts` — wraps NetInfo.addEventListener
- [ ] Create `src/components/OfflineBanner.tsx` — yellow banner "You're offline"
- [ ] Add to root _layout.tsx, show above all content
- [ ] TanStack Query: set `networkMode: "offlineFirst"` to allow cached data when offline

### 4. Accessibility audit
- [ ] Ensure all TouchableOpacity have minHeight/minWidth 44
- [ ] Add accessibilityLabel to all interactive elements missing them
- [ ] Add accessibilityRole="button" to all touchable elements
- [ ] Use `allowFontScaling={true}` (default) on all Text components
- [ ] Add accessibilityHint where action isn't obvious from label

### 5. Create analytics service
- [ ] Create `src/services/analytics.ts` with `track(event, properties?)` function
- [ ] Define event types enum: CATALOG_VIEW, COURSE_VIEW, LESSON_VIEW, etc.
- [ ] Log to console in __DEV__, no-op in production (placeholder for SDK)
- [ ] Add `useAnalytics()` hook returning `track` function
- [ ] Add analytics calls to: catalog screen, course detail, lesson player

### 6. Labs web CTA
- [ ] In course detail, stop filtering out lab lessons
- [ ] Show lab lessons with a "🔬 Lab available on web" badge
- [ ] Lab lessons are still not navigable (disabled) but visible

### 7. Autoplay next lesson
- [ ] Add `autoplayEnabled` setting in AsyncStorage (default: true)
- [ ] In completion overlay: if autoplay ON and nextLesson exists, show 5s countdown
- [ ] Countdown ticks every 1s, navigates to next lesson at 0
- [ ] "Cancel" button stops countdown
- [ ] Add autoplay toggle to Settings screen

### 8. Tests
- [ ] Test ErrorBoundary catches errors
- [ ] Test analytics event tracking
- [ ] Test autoplay countdown logic

### 9. Commit and push
- [ ] Commit with descriptive message
- [ ] Push to GitHub
