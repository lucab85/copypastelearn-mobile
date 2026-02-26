## Tasks

### 1. Install expo-screen-orientation
- [ ] `npm install expo-screen-orientation --legacy-peer-deps`

### 2. Implement buffering indicator
- [ ] Add `isBuffering` state to player, triggered from `onPlaybackStatusUpdate`
- [ ] Add 500ms debounce: only show overlay if buffering > 500ms
- [ ] Render semi-transparent overlay with ActivityIndicator over video

### 3. Implement error retry UI
- [ ] Add `videoError` state; set on playback error
- [ ] Show error overlay with "Video failed to load" + "Retry" button
- [ ] Retry: refetch Mux tokens, reset video source, clear error state
- [ ] Auto-retry once on token-related errors before showing UI

### 4. Implement orientation lock
- [ ] Import `lockAsync`, `unlockAsync`, `OrientationLock` from expo-screen-orientation
- [ ] Add landscape lock toggle button below video
- [ ] On screen exit (useEffect cleanup), unlock orientation
- [ ] Wrap in try/catch; hide button if API fails

### 5. Implement completion overlay
- [ ] Add `showCompletion` state; set when `didJustFinish` fires
- [ ] Show overlay: "🎉 Lesson Complete" with green checkmark
- [ ] "Next Lesson" button if `lesson.nextLesson` exists → navigate
- [ ] "Watch Again" button → seek to 0, hide overlay

### 6. Tests
- [ ] Test buffering debounce logic (500ms threshold)
- [ ] Test error state transitions

### 7. Commit and push
- [ ] Commit with descriptive message
- [ ] Push to GitHub
