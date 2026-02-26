## Why

The app needs final production polish: proper app config (app.json), splash screen, app icon setup, SafeAreaView everywhere, keyboard handling, haptic feedback, better loading states, and smoother transitions.

## What Changes

### 1. App Config (app.json/app.config.ts)
- App name, slug, version, icon, splash, iOS/Android config
- Scheme for deep linking
- Orientation: portrait default

### 2. SafeAreaView on all screens
- Wrap all tab screens in SafeAreaView to handle notch/dynamic island

### 3. Keyboard handling improvements
- KeyboardAvoidingView on all input screens
- Dismiss keyboard on scroll/tap outside

### 4. Loading/transition polish
- Fade transitions between screens
- Better skeleton shimmer timing

### 5. Pull-to-refresh on dashboard
- Already on catalog, need on dashboard too

### 6. Better empty states
- Illustration-quality empty states with actionable CTAs

### 7. Haptic feedback on key interactions
- expo-haptics for button presses, completion, errors
