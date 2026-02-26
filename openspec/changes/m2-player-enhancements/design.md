## Context

The lesson player screen already has resume-from-position, playback speed control, keep-screen-awake, and save-on-pause. However it needs better handling of buffering states (user sees nothing during buffering), errors (no retry mechanism), and orientation for landscape video viewing.

expo-screen-orientation is available in Expo Go and can lock to landscape.

## Goals / Non-Goals

**Goals:**
- Show buffering spinner overlay when video is loading/rebuffering
- Provide clear error UI with retry when video fails to load
- Allow user to toggle landscape mode for immersive viewing
- Show a brief completion state when lesson finishes with next lesson CTA

**Non-Goals:**
- Picture-in-picture mode (requires dev build)
- Chromecast/AirPlay support
- Offline video download
- Custom video controls (using native controls via expo-av)

## Decisions

### 1. Buffering indicator as overlay
**Choice:** Semi-transparent overlay with ActivityIndicator on top of video during `isBuffering` state.
**Why:** Native controls still visible underneath; clear visual feedback without replacing the video view.

### 2. expo-screen-orientation for lock
**Choice:** Use `expo-screen-orientation` lockAsync/unlockAsync.
**Why:** Works in Expo Go, clean API. Lock to landscape on button tap, unlock on exit.
**Alternative:** Listening to device rotation only — doesn't allow user-initiated lock.

### 3. Completion modal overlay
**Choice:** In-screen overlay (not a modal/navigation) showing "✓ Lesson Complete" with confetti emoji and "Next Lesson" button.
**Why:** Keeps user in context; no navigation disruption. Dismissible to re-watch.

## Risks / Trade-offs

- [expo-screen-orientation may not work in all Expo Go versions] → Graceful fallback: hide the button if API unavailable
- [Buffering overlay flickers on fast networks] → Only show after 500ms of buffering (debounce)
