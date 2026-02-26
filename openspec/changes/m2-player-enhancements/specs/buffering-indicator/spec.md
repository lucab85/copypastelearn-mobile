## ADDED Requirements

### Requirement: Buffering overlay SHALL display during video buffering
The player SHALL show a semi-transparent overlay with a spinner when the video is buffering.

#### Scenario: Video rebuffering
- **WHEN** the video `isBuffering` state is true for more than 500ms
- **THEN** a semi-transparent dark overlay with ActivityIndicator SHALL be shown over the video

#### Scenario: Buffering resolves quickly
- **WHEN** buffering lasts less than 500ms
- **THEN** no overlay SHALL be shown (prevents flicker)
