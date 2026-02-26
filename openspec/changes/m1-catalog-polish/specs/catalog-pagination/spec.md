## ADDED Requirements

### Requirement: Infinite scroll pagination
The catalog course list loads courses in pages of 20. When the user scrolls near the bottom, the next page loads automatically.

#### Scenario: Initial load
- **WHEN** user opens the catalog screen
- **THEN** the first 20 courses are displayed with a loading skeleton during fetch

#### Scenario: Load next page
- **WHEN** user scrolls within 200px of the bottom and more pages exist
- **THEN** the next 20 courses are appended with a small loading indicator at the bottom

#### Scenario: All courses loaded
- **WHEN** user scrolls to the bottom and no more pages exist
- **THEN** no loading indicator is shown and no additional API calls are made

### Requirement: Paginated API response
The `/api/mobile/courses` endpoint accepts `cursor` and `limit` query parameters.

#### Scenario: First page request
- **WHEN** client requests `/api/mobile/courses?limit=20`
- **THEN** response includes `data: CourseListItem[]` and `nextCursor: string | null`

#### Scenario: Subsequent page request
- **WHEN** client requests `/api/mobile/courses?limit=20&cursor=<id>`
- **THEN** response includes courses after the cursor, with `nextCursor` for the next page
