## ADDED Requirements

### Requirement: Error retry UI SHALL display on video failure
The player SHALL show an error message with a retry button when video loading fails.

#### Scenario: Video load error
- **WHEN** expo-av reports a playback error
- **THEN** the player SHALL show "Video failed to load" with a "Retry" button

#### Scenario: Retry action
- **WHEN** user taps "Retry"
- **THEN** the player SHALL refetch Mux tokens and reload the video source

#### Scenario: Mux token expiry
- **WHEN** playback fails due to token expiry (detected via error or 403)
- **THEN** the player SHALL automatically refetch tokens once before showing error UI
