## Context

The app has solid functionality (M0-M3) but needs visual polish to compete with professional learning apps. This milestone creates a design system and applies it everywhere.

## Goals / Non-Goals

**Goals:**
- Establish a reusable design system (theme.ts)
- Premium card components with depth (shadows, gradients)
- "Continue Learning" hero that drives re-engagement
- Branded, cohesive look across all screens
- Course thumbnails with gradient fallbacks when no image
- Progress visualization (rings, bars) that feel satisfying
- Time-of-day greeting on dashboard

**Non-Goals:**
- Custom animations/micro-interactions (v1.1)
- Dark mode (v1.1)
- Custom fonts (stick with system fonts for Expo Go)
- Lottie animations

## Decisions

### 1. Design System in single theme.ts file
**Choice:** One file with colors, typography, spacing, shadows, borderRadii
**Why:** Single source of truth. Easy to update. No design token library overhead.

### 2. Color palette: Blue primary + warm neutrals
**Choice:** Primary #2563eb (blue-600), accent #f59e0b (amber-500), success #16a34a, backgrounds #f8fafc/#ffffff
**Why:** Blue = trust/learning. Amber accent = warmth/progress. Matches web brand.

### 3. Course thumbnail strategy
**Choice:** Show course.imageUrl if available, otherwise generate a gradient from course title hash
**Why:** Guaranteed visual variety even without images. No broken image states.

### 4. Progress ring (SVG-free)
**Choice:** Use React Native's circular border trick (two semi-circles with rotation)
**Why:** No SVG dependency needed. Works in Expo Go. Lightweight.

### 5. Card elevation pattern
**Choice:** Subtle shadow (iOS) + elevation (Android) + 1px border for depth
**Why:** Cross-platform consistent depth. Premium feel without heavy shadows.

## Risks / Trade-offs

- [No custom fonts] → System fonts are fine; San Francisco / Roboto are excellent
- [No SVG for progress rings] → Border trick works for simple rings; complex charts would need SVG
- [Gradient fallbacks are deterministic] → Same course always gets same gradient (good for consistency)
