## Why

The app works functionally but looks like a prototype. A premium learning app in 2026 needs: a proper design system (consistent colors, typography, spacing), branded theme with the CopyPasteLearn identity, polished card components with shadows/gradients, a hero "Continue Learning" section, course thumbnails/images, smooth transitions, and an onboarding-quality first impression. Users compare against Udemy, Coursera, and YouTube — we need to match that quality bar.

## What Changes

### 1. Design System & Theme
- Centralized theme file: colors, typography scale, spacing, border radii, shadows
- Consistent use across all screens
- Dark header / light content pattern (common in video apps)

### 2. Home Screen (Dashboard) Redesign
- "Continue Learning" hero card with course thumbnail, progress ring, and resume CTA
- "Recently Completed" horizontal scroll section
- Stats row (courses in progress, completed, streak)
- Greeting based on time of day

### 3. Catalog Redesign
- Course cards with thumbnail placeholder (gradient fallback), category pill, lesson count, duration
- Sticky search bar with filter chips (All, In Progress, Completed, Free)
- Grid/list toggle option

### 4. Course Detail Redesign
- Hero header with gradient overlay, course title, instructor, lesson count
- Progress ring component (circular progress indicator)
- Lesson list with status icons (completed ✓, in progress ▶, locked 🔒)
- Sticky "Continue" CTA button at bottom

### 5. Settings Redesign
- Profile card with avatar and subscription status
- Grouped settings with icons
- App branding footer

### 6. Auth Screens
- Branded sign-in/sign-up with logo, tagline

## Impact

- New: `src/theme.ts` (design system)
- New: `src/components/ProgressRing.tsx`
- New: `src/components/CourseCard.tsx`
- New: `src/components/HeroCard.tsx`
- Modified: All screen files
- Modified: All component styles
