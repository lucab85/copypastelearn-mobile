## ADDED Requirements

### Requirement: Skeleton placeholders during loading
All data-fetching screens show animated skeleton placeholders instead of spinners.

#### Scenario: Catalog loading
- **WHEN** courses are being fetched
- **THEN** 4 skeleton course cards are shown with a shimmer animation

#### Scenario: Course detail loading
- **WHEN** course detail is being fetched
- **THEN** skeleton header + 5 skeleton lesson rows are shown

#### Scenario: Dashboard loading
- **WHEN** dashboard data is being fetched
- **THEN** skeleton "Continue Learning" cards are shown

### Requirement: Shimmer animation
Skeleton components use a pulsing opacity animation (0.3 → 0.7) at 1s interval using React Native's Animated API.

#### Scenario: Animation runs
- **WHEN** skeleton is visible
- **THEN** opacity pulses smoothly between 0.3 and 0.7
