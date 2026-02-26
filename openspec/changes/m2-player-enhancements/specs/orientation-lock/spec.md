## ADDED Requirements

### Requirement: Orientation lock toggle SHALL be available
The player SHALL provide a button to lock screen orientation to landscape.

#### Scenario: User taps landscape button
- **WHEN** user taps the orientation lock button
- **THEN** screen SHALL lock to landscape orientation

#### Scenario: User taps unlock
- **WHEN** user taps the button again or navigates away
- **THEN** screen orientation SHALL unlock to default (portrait + auto)

#### Scenario: API unavailable
- **WHEN** expo-screen-orientation is not available
- **THEN** the orientation button SHALL be hidden
