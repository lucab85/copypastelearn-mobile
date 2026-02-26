# CopyPasteLearn Mobile

iOS/Android app for browsing courses and watching lessons with cross-device resume. Built with Expo (React Native) and shares authentication with the web app via Clerk.

> **⚠️ Web repo dependency:** The mobile API routes (`/api/mobile/*`) live on the [`feature/mobile-api`](https://github.com/lucab85/copypastelearn.com/tree/feature/mobile-api) branch of the web repo. Merge that branch before running the mobile app.

## Prerequisites

- Node.js 18+
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- The CopyPasteLearn web backend running with the `feature/mobile-api` branch merged

## Setup

1. **Clone and install:**
   ```bash
   cd copypastelearn-mobile
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables:**

   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
   ```

   - `EXPO_PUBLIC_API_BASE_URL` — Base URL of the CopyPasteLearn web app (where `/api/mobile/*` routes are served)
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Same Clerk publishable key used by the web app

## Run

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Platform-specific:
```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

## Project Structure

```
app/
  _layout.tsx              Root layout (Clerk + React Query providers)
  (auth)/
    sign-in.tsx            Sign in screen
    sign-up.tsx            Sign up + email verification
  (tabs)/
    _layout.tsx            Bottom tab navigation
    index.tsx              Home (Continue Learning dashboard)
    catalog/
      index.tsx            Course list with search
      [slug].tsx           Course detail with lesson list
    settings.tsx           Profile, sign out, legal links
  lesson/
    [courseSlug]/
      [lessonSlug].tsx     Video player with progress sync

src/
  services/
    apiClient.ts           API client with Clerk token injection + error handling
    tokenCache.ts          Secure token storage for Clerk
    types.ts               TypeScript types (mirrored from shared package)
  hooks/
    useDebouncedCallback.ts
```

## Features

- **Clerk authentication** — Same account as web, secure token storage via expo-secure-store
- **Course catalog** — Browse and search all published courses
- **Video playback** — Mux-backed HLS streaming via expo-av with signed tokens
- **Progress sync** — Position saved every 10s (only while playing) + on pause/background/close
- **Resume prompt** — "Resume from 12:34?" or "Start Over" on lesson re-entry
- **Playback speed** — 1x / 1.25x / 1.5x / 1.75x / 2x
- **Keep screen awake** — Screen stays on during video playback
- **Auto-complete** — Lessons marked complete when video finishes
- **Token refresh** — Mux playback tokens auto-refetched on error
- **401 handling** — Auto sign-out + redirect on expired/invalid auth

## Architecture Decisions

- **expo-av** over expo-video — expo-av works in Expo Go; expo-video requires a dev build
- **TanStack Query** for server state — caching, refetching, stale-while-revalidate
- **expo-router** for file-based routing — matches Next.js conventions from the web app
- **No labs** — Lab functionality is intentionally hidden on mobile (FR-9)
- **No Zustand** — TanStack Query handles all server state; no additional state library needed

## Common Issues

| Issue | Solution |
|-------|----------|
| "Network error" on all requests | Check `EXPO_PUBLIC_API_BASE_URL` — must be reachable from your device (not `localhost` unless using a tunnel) |
| "Authentication required" loop | Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` matches the web app's key (same Clerk tenant) |
| Video won't play | Ensure the Mux token endpoint is deployed (`/api/mobile/mux/tokens/[playbackId]`). Check that `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are set on the backend |
| "Preset jest-expo not found" | Run `npm install --legacy-peer-deps` to install all dependencies |
| API routes return 404 | The `feature/mobile-api` branch needs to be merged into the web repo's main branch |

## Testing

```bash
npm test
```

3 test suites covering token cache, API types, and HTTP client behavior.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`): TypeScript check → lint → tests with coverage. Runs on push/PR to main.

## API

See [API_INVENTORY.md](./API_INVENTORY.md) for the full API documentation.
