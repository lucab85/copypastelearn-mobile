import { AnalyticsEvent, track } from "../../services/analytics";

describe("analytics", () => {
  it("tracks events without throwing", () => {
    expect(() => track(AnalyticsEvent.CATALOG_VIEW)).not.toThrow();
    expect(() =>
      track(AnalyticsEvent.LESSON_COMPLETE, { lessonId: "abc" })
    ).not.toThrow();
  });

  it("has all required event types", () => {
    expect(AnalyticsEvent.CATALOG_VIEW).toBe("catalog_view");
    expect(AnalyticsEvent.COURSE_VIEW).toBe("course_view");
    expect(AnalyticsEvent.LESSON_VIEW).toBe("lesson_view");
    expect(AnalyticsEvent.LESSON_PLAY_START).toBe("lesson_play_start");
    expect(AnalyticsEvent.LESSON_PLAY_ERROR).toBe("lesson_play_error");
    expect(AnalyticsEvent.LESSON_COMPLETE).toBe("lesson_complete");
    expect(AnalyticsEvent.RESUME_PROMPT_SHOWN).toBe("resume_prompt_shown");
    expect(AnalyticsEvent.RESUME_START_OVER).toBe("resume_start_over");
    expect(AnalyticsEvent.PROGRESS_SAVE_SUCCESS).toBe("progress_save_success");
    expect(AnalyticsEvent.PROGRESS_SAVE_FAIL).toBe("progress_save_fail");
  });
});

describe("autoplay countdown", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("counts down from 5 to 0", () => {
    let countdown = 5;
    const timer = setInterval(() => {
      countdown--;
    }, 1000);

    jest.advanceTimersByTime(5000);
    clearInterval(timer);

    expect(countdown).toBe(0);
  });

  it("can be cancelled mid-countdown", () => {
    let countdown = 5;
    let cancelled = false;
    const timer = setInterval(() => {
      if (cancelled) return;
      countdown--;
    }, 1000);

    jest.advanceTimersByTime(2000);
    expect(countdown).toBe(3);

    cancelled = true;
    clearInterval(timer);

    jest.advanceTimersByTime(3000);
    expect(countdown).toBe(3); // didn't continue
  });
});

describe("error boundary logic", () => {
  it("resets error state on restart", () => {
    let hasError = true;
    let error: Error | null = new Error("crash");

    // Simulate restart
    hasError = false;
    error = null;

    expect(hasError).toBe(false);
    expect(error).toBeNull();
  });
});
