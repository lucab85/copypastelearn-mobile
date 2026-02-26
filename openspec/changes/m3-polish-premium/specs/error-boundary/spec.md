## ADDED Requirements

### Requirement: App SHALL recover from JS crashes gracefully
A global error boundary SHALL catch unhandled React errors and show recovery UI.

#### Scenario: Component crash
- **WHEN** a React component throws during render
- **THEN** an error screen SHALL be shown with "Something went wrong" and a "Restart" button

#### Scenario: Recovery
- **WHEN** user taps "Restart"
- **THEN** the error boundary SHALL reset and re-render the app
