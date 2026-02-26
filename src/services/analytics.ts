// Analytics service — pluggable event tracking
// In dev: logs to console. In prod: no-op (replace with Mixpanel/Amplitude SDK)

export enum AnalyticsEvent {
  CATALOG_VIEW = "catalog_view",
  COURSE_VIEW = "course_view",
  LESSON_VIEW = "lesson_view",
  LESSON_PLAY_START = "lesson_play_start",
  LESSON_PLAY_ERROR = "lesson_play_error",
  LESSON_COMPLETE = "lesson_complete",
  RESUME_PROMPT_SHOWN = "resume_prompt_shown",
  RESUME_START_OVER = "resume_start_over",
  PROGRESS_SAVE_SUCCESS = "progress_save_success",
  PROGRESS_SAVE_FAIL = "progress_save_fail",
}

type EventProperties = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, properties?: EventProperties): void {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log(`[Analytics] ${event}`, properties ?? "");
  }
  // TODO: Replace with SDK call
  // mixpanel.track(event, { ...properties, userId: clerkUserId });
}

export function useAnalytics() {
  return { track };
}
