## ADDED Requirements

### Requirement: Debounced search input
Search input debounces by 300ms before filtering results.

#### Scenario: User types quickly
- **WHEN** user types "react" one character at a time
- **THEN** filtering runs only once, 300ms after the last keystroke

#### Scenario: User clears search
- **WHEN** user clears the search field
- **THEN** full unfiltered course list is shown immediately

### Requirement: Empty state
When search yields no results, a helpful empty state is shown.

#### Scenario: No matching courses
- **WHEN** user searches and no courses match
- **THEN** an illustration/icon with "No courses found" message and "Clear search" button is shown

### Requirement: Search accessibility
Search input has proper accessibility labels and hints.

#### Scenario: Screen reader
- **WHEN** screen reader focuses on search input
- **THEN** it announces "Search courses" with hint "Type to filter courses by title"
