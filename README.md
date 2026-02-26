# CopyPasteLearn Mobile

iOS/Android app for browsing courses and watching lessons with cross-device resume. Built with Expo (React Native) and shares authentication with the web app via Clerk.

## Prerequisites

- Node.js 18+
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- The CopyPasteLearn web backend running (provides the API)

## Setup

1. **Clone and install:**
   ```bash
   cd copypastelearn-mobile
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
   ```

   - `EXPO_PUBLIC_API_BASE_URL` — Base URL of the CopyPasteLearn web app (where `/api/mobile/*` routes are served)
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Same Clerk publishable key used by the web app

3. **Ensure mobile API routes are deployed:**

   The web backend needs the `/api/mobile/*` routes (see `API_INVENTORY.md`). These are located in `apps/web/src/app/api/mobile/` in the web repo.

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
    apiClient.ts           API client with Clerk token injection
    tokenCache.ts          Secure token storage for Clerk
    types.ts               TypeScript types (mirrored from shared package)
  hooks/
    useDebouncedCallback.ts
```

## Features

- **Clerk authentication** — Same account as web, secure token storage via expo-secure-store
- **Course catalog** — Browse and search all published courses
- **Video playback** — Mux-backed streaming via expo-av with signed tokens
- **Progress sync** — Position saved every 10s + on background/close, resumes cross-device
- **Auto-complete** — Lessons marked complete when video finishes

## Architecture Decisions

- **expo-av** over expo-video — expo-av works in Expo Go; expo-video requires a dev build
- **TanStack Query** for server state — caching, refetching, optimistic updates
- **expo-router** for file-based routing — matches Next.js conventions from the web app
- **No labs** — Lab functionality is intentionally hidden on mobile (FR-9)

## API

See [API_INVENTORY.md](./API_INVENTORY.md) for the full API documentation.
