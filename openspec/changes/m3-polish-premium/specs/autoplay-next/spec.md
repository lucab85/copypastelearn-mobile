## ADDED Requirements

### Requirement: App SHALL autoplay next lesson after completion
After lesson completion, the app SHALL auto-navigate to the next lesson.

#### Scenario: Autoplay countdown
- **WHEN** lesson completes and next lesson exists and autoplay is enabled
- **THEN** a 5-second countdown SHALL appear on the completion overlay

#### Scenario: Cancel autoplay
- **WHEN** user taps "Cancel" during countdown
- **THEN** autoplay SHALL be cancelled and overlay remains

#### Scenario: Autoplay disabled
- **WHEN** autoplay is toggled off in settings
- **THEN** no countdown SHALL appear on completion
