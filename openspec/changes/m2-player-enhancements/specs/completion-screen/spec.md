## ADDED Requirements

### Requirement: Completion screen SHALL display when lesson finishes
The player SHALL show a completion overlay when the video finishes.

#### Scenario: Video finishes
- **WHEN** video playback reaches the end (didJustFinish)
- **THEN** an overlay SHALL appear showing "✓ Lesson Complete" with confetti emoji

#### Scenario: Next lesson available
- **WHEN** completion overlay is shown and nextLesson exists
- **THEN** a "Next Lesson" button SHALL be displayed

#### Scenario: Dismiss completion
- **WHEN** user taps "Watch Again" or the dismiss button
- **THEN** the overlay SHALL hide and video SHALL seek to beginning
