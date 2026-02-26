## ADDED Requirements

### Requirement: Course card progress bar
Course cards in the catalog show a progress bar when the user has started the course.

#### Scenario: Course not started
- **WHEN** user has no progress on a course
- **THEN** no progress bar is shown on the card

#### Scenario: Course in progress
- **WHEN** user has 40% completion on a course
- **THEN** a blue progress bar at 40% is shown at the bottom of the card

#### Scenario: Course completed
- **WHEN** user has 100% completion
- **THEN** a green progress bar with "✓ Complete" badge is shown

### Requirement: Lesson completion checkmarks
Course detail screen shows checkmarks next to completed lessons.

#### Scenario: Completed lesson
- **WHEN** a lesson is marked complete
- **THEN** a green checkmark icon is shown next to the lesson title

#### Scenario: In-progress lesson
- **WHEN** a lesson has saved position but is not complete
- **THEN** a small progress indicator (e.g., "12:34 / 20:00") is shown
