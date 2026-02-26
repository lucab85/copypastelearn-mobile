## ADDED Requirements

### Requirement: Pull-to-refresh on catalog
User can pull down on the catalog list to refresh courses.

#### Scenario: Pull to refresh
- **WHEN** user pulls down on the catalog FlatList
- **THEN** courses are refetched from page 1 and the refresh indicator is shown

### Requirement: Pull-to-refresh on dashboard
User can pull down on the dashboard to refresh learning data.

#### Scenario: Pull to refresh dashboard
- **WHEN** user pulls down on the dashboard ScrollView
- **THEN** dashboard data is refetched and the refresh indicator is shown
