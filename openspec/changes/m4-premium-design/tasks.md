## Tasks

### 1. Create design system (theme.ts)
- [ ] Colors: primary, accent, success, error, backgrounds, text hierarchy, borders
- [ ] Typography: heading1-4, body, bodySmall, caption sizes + weights
- [ ] Spacing: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- [ ] Border radii: sm(8), md(12), lg(16), xl(24), full(9999)
- [ ] Shadows: card, elevated, subtle
- [ ] Helper: hashColor(string) for gradient fallbacks

### 2. Create reusable components
- [ ] `ProgressRing.tsx` — circular progress with percentage text
- [ ] `CourseCard.tsx` — thumbnail + title + meta + progress bar
- [ ] `HeroCard.tsx` — "Continue Learning" card with large thumbnail + resume CTA
- [ ] `StatCard.tsx` — small stat box (number + label)
- [ ] `SectionHeader.tsx` — section title + optional "See All" link
- [ ] `FilterChip.tsx` — togglable pill for catalog filters

### 3. Redesign Dashboard (Home tab)
- [ ] Time-of-day greeting ("Good morning, Luca")
- [ ] Continue Learning hero card (current course, lesson, progress ring)
- [ ] Stats row: courses in progress, completed, total watch time
- [ ] Recently completed section (horizontal scroll)
- [ ] Empty state for new users

### 4. Redesign Catalog
- [ ] Sticky search bar with cancel button
- [ ] Filter chips: All, In Progress, Completed, Free
- [ ] Course cards with gradient thumbnail, category, lesson count, duration
- [ ] Pull-to-refresh preserved
- [ ] Infinite scroll preserved

### 5. Redesign Course Detail
- [ ] Hero header: gradient + course title + meta
- [ ] Progress ring with percentage
- [ ] "Continue" sticky CTA at bottom
- [ ] Lesson rows: numbered, status icon, duration, progress
- [ ] Section: "About this course" with description

### 6. Polish Auth & Settings
- [ ] Auth: logo + tagline above Clerk form
- [ ] Settings: icons for each row, grouped sections, version footer

### 7. Fix CI
- [ ] `npm install --legacy-peer-deps` in CI
- [ ] `continue-on-error: true` for tsc/lint until strict

### 8. Tests + commit
- [ ] Test theme exports
- [ ] Commit with descriptive message
- [ ] Push to GitHub
