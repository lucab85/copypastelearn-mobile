# PRD — CopyPasteLearn Mobile (Video-Only) — React Native (Expo Go)

## 1) Executive Summary

Vision: iOS/Android app to browse courses + watch lessons with cross-device resume. Uses same account as web (Clerk). Labs not available on mobile.

Platforms: Expo (managed), runs in Expo Go for dev.

Success metrics (MVP):
- Activation: start first lesson <24h
- Engagement: play starts/user/week, completion rate
- Continuity: % resumes across devices
- Quality: crash-free sessions, video errors, API errors

## 2) Problem & Goals

Problems: web isn't ideal on mobile; users want "open → continue lesson"; progress must sync.

Goals (MVP):
- Clerk sign-in shared with web
- Catalog → course → lesson playback
- Progress sync (position + completion)
- Fast, stable playback (Mux-backed like web)

Non-goals (MVP):
- Labs (hide everywhere)
- In-app purchases/subscription purchase flows
- Offline downloads (v1.1+)

## 3) Scope

MVP screens:
- Welcome / Sign in
- Home (Continue Learning)
- Catalog (search + list)
- Course Detail (lesson list)
- Lesson Player (video + resume)
- Settings/Profile (account + sign out + support/legal)

MVP features:
- Auth via Clerk (secure token storage)
- Fetch courses/lessons via existing APIs in web repo
- Play video (Expo-compatible player)
- Save/resume progress cross-device

## 4) User Journeys

A. Continue learning: Open app → Home → "Continue" card → opens lesson at last position.

B. Browse & start: Catalog → Course → pick lesson → play.

C. Progress sync: Player sends position every 10–15s (debounced) + on background/close. Web later shows same resume state.

## 5) Requirements

### Functional (FR)
- FR-1: Clerk auth (same tenant as web)
- FR-2: Secure token storage (Expo SecureStore)
- FR-3: Catalog list + search (API-first)
- FR-4: Course detail + lesson list
- FR-5: Lesson playback with loading/error/retry
- FR-6: Resume from last saved position
- FR-7: Save progress (position + completion) to backend
- FR-8: Settings: account, sign out, legal, support
- FR-9: Labs are not displayed anywhere

### Non-functional (NFR)
- Startup performance target, crash-free >99.5%
- Accessibility: labels, dynamic type, touch targets
- Privacy: no PII in logs; redact signed URLs

## 6) API Requirements

Rule: reuse APIs defined in https://github.com/lucab85/copypastelearn.com.

Deliverable: agent must generate an API Inventory doc by scanning repo routes (Next.js app/api/**/route.ts, pages/api/**, etc.): method/path/auth/request/response, and which endpoints mobile uses.

Auth: mobile sends Authorization: Bearer <Clerk token>; backend validates same as web.

Known from repo docs: Stripe webhook at /api/webhooks/stripe (not used by mobile MVP).

## 7) Video Playback (Expo Go compatible)

Use Expo-supported video (expo-av Video) to ensure Expo Go works.

Use existing web flow for Mux signed playback (via existing API route if present). If missing, agent may add the smallest new endpoint (server-side signing) and justify.

## 8) Technical Architecture (Mobile)

- Expo + TypeScript
- React Navigation / expo-router (file-based)
- TanStack Query
- Clerk Expo SDK
- Services: apiClient, auth, video, analytics

Folder layout:
```
src/features/*
src/services/*
src/navigation/*
src/components/*
```

## 9) Repo Requirements

- Create new repo: copypastelearn-mobile
- Must run: `npx expo start` → open in Expo Go
- Add ESLint/Prettier, CI (lint/typecheck/test), README with env vars:
  - `EXPO_PUBLIC_API_BASE_URL`
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

## 10) Milestones

- M0 — Scaffold (Day 1-2): Expo init, Clerk sign-in, skeleton nav
- M1 — Catalog (Day 3-5): Fetch & display courses/lessons, search
- M2 — Player (Day 6-9): Video playback, resume, progress save
- M3 — Polish (Day 10-12): Error handling, loading states, accessibility, Settings
- M4 — QA & Submit (Day 13-14): Device testing, store assets, EAS submit

## 11) Open Questions

- OQ-1: Does Mux playback token need per-video signing from backend, or can mobile reuse the same endpoint web uses?
- OQ-2: expo-av vs expo-video — which runs in Expo Go today? (agent should verify)
- OQ-3: Any rate limits on Clerk or backend APIs for mobile?

## 12) Deliverables the Agent Must Produce

1. Expo project scaffold (app/ folder, expo-router)
2. Clerk auth integration (sign-in screen + token storage)
3. Catalog, course detail, lesson player screens
4. Progress save/resume logic
5. API Inventory doc (scan web repo, list endpoints, mark which ones mobile uses)
6. README with setup + run instructions
