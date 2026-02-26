## ADDED Requirements

### Requirement: App SHALL track key funnel events
The app SHALL fire analytics events for user funnel tracking.

#### Scenario: Events tracked
- **WHEN** user performs key actions
- **THEN** the following events SHALL be logged:
  - catalog_view, course_view, lesson_view
  - lesson_play_start, lesson_play_error, lesson_complete
  - resume_prompt_shown, resume_start_over
  - progress_save_success, progress_save_fail
