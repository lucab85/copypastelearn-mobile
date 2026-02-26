## ADDED Requirements

### Requirement: App SHALL indicate offline state
The app SHALL show a banner when the device is offline.

#### Scenario: Device goes offline
- **WHEN** network connectivity is lost
- **THEN** a yellow banner SHALL appear at the top: "You're offline"

#### Scenario: Device comes back online
- **WHEN** network connectivity is restored
- **THEN** the banner SHALL dismiss and data SHALL refetch

### Requirement: Cached data SHALL remain browsable offline
- **WHEN** device is offline but cached data exists
- **THEN** user SHALL be able to browse previously loaded courses and lessons
