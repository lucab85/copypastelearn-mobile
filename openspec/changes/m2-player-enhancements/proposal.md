## Why

The M0 video player works but lacks resilience and power-user features. Buffering has no visual indicator, errors don't offer retry, and there's no orientation lock for landscape viewing. The player needs to feel robust and handle edge cases gracefully.

## What Changes

- Add buffering/loading indicator overlay during video buffering
- Add error retry UI with exponential backoff for video load failures
- Add orientation lock toggle for landscape video viewing
- Add "lesson complete" celebration screen with next lesson prompt
- Improve progress save reliability with save-on-seek behavior

## Capabilities

### New Capabilities
- `buffering-indicator`: Visual overlay during video buffering states
- `error-retry-ui`: Error state with retry button and backoff for video failures
- `orientation-lock`: Toggle landscape lock during video playback
- `completion-screen`: Lesson complete celebration with next lesson navigation

### Modified Capabilities

## Impact

- `app/lesson/[courseSlug]/[lessonSlug].tsx` — all changes concentrated here
- May need `expo-screen-orientation` for orientation lock (Expo Go compatible)
