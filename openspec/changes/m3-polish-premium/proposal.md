## Why

The app is functional but needs premium polish to make CopyPasteLearn shine on mobile. Users expect 2026-quality apps with proper error boundaries, offline awareness, accessibility, analytics, and small delight touches. The PRD review also identified gaps: offline behavior spec, analytics taxonomy, and accessibility audit.

## What Changes

- Add global error boundary with recovery UI
- Add offline/connectivity banner with stale-while-revalidate caching
- Accessibility audit: proper labels, touch targets (44px min), dynamic type support
- Add minimal analytics event tracking (lesson_play_start, lesson_complete, etc.)
- Add "Open labs on web" CTA for lab-having lessons (instead of completely hiding them)
- Add autoplay next lesson feature
- Add bookmarks/save-for-later (local-only v1)

## Capabilities

### New Capabilities
- `error-boundary`: Global error boundary with crash recovery UI
- `offline-awareness`: Connectivity detection + offline banner + stale data display
- `accessibility-polish`: Touch targets, labels, dynamic type, screen reader support
- `analytics-events`: Minimal event tracking taxonomy
- `labs-web-cta`: "Open labs on web" link for lab lessons
- `autoplay-next`: Auto-navigate to next lesson after completion

### Modified Capabilities

## Impact

- `app/_layout.tsx` — error boundary wrapper, connectivity provider
- All screens — accessibility improvements, touch target sizing
- `app/lesson/[courseSlug]/[lessonSlug].tsx` — autoplay next, analytics
- `app/(tabs)/catalog/[slug].tsx` — labs CTA, bookmarks
- New: `src/components/ErrorBoundary.tsx`
- New: `src/components/OfflineBanner.tsx`
- New: `src/services/analytics.ts`
- New: `src/hooks/useNetworkState.ts`
