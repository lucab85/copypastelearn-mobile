## Context

The app has solid M0-M2 functionality. This milestone adds the "premium feel" — things users don't explicitly ask for but notice when missing. Error crashes, offline confusion, small touch targets, and no analytics feedback are all friction points.

## Goals / Non-Goals

**Goals:**
- Crash recovery: error boundary catches JS errors, shows recovery UI
- Offline: detect network state, show banner, allow browsing cached data
- Accessibility: 44px min touch targets, all interactive elements labeled, dynamic type
- Minimal analytics: key funnel events only (no third-party SDK in v1, just hooks)
- Labs awareness: show "Available on web" instead of hiding completely
- Autoplay next: opt-in auto-continue after lesson completion (3s countdown)

**Non-Goals:**
- Full analytics integration (Mixpanel/Amplitude) — just hooks for now
- Downloads for offline viewing
- Deep accessibility audit (VoiceOver/TalkBack full testing)
- Push notifications

## Decisions

### 1. Error boundary as React component
**Choice:** Class-based ErrorBoundary wrapping the app in _layout.tsx
**Why:** React error boundaries require class components with getDerivedStateFromError.

### 2. Network detection via @react-native-community/netinfo
**Choice:** Use NetInfo.addEventListener for connectivity state.
**Why:** Most reliable cross-platform solution. Works in Expo Go.

### 3. Analytics as local hooks (no SDK)
**Choice:** Create useAnalytics() hook that logs events to console in dev, and provides structure for future SDK integration.
**Why:** No third-party dependency. Event taxonomy is defined; plug in Mixpanel/Amplitude later.

### 4. Autoplay with countdown
**Choice:** 5s countdown on completion overlay, auto-navigate to next lesson unless cancelled.
**Why:** Matches YouTube/Netflix behavior. Cancellable respects user control.

## Risks / Trade-offs

- [NetInfo may need native module in some Expo SDK versions] → Falls back to assuming online
- [Error boundary can't catch async errors] → Combine with try/catch in async functions
- [Autoplay may annoy some users] → Add toggle in settings; default ON
