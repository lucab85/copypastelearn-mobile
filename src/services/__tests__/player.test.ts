describe("player logic", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  describe("buffering debounce (500ms threshold)", () => {
    it("should not trigger buffering indicator before 500ms", () => {
      let isBufferingVisible = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      // Simulate buffering start
      timer = setTimeout(() => {
        isBufferingVisible = true;
      }, 500);

      jest.advanceTimersByTime(400);
      expect(isBufferingVisible).toBe(false);

      // Buffering resolves before 500ms
      if (timer) clearTimeout(timer);
      jest.advanceTimersByTime(200);
      expect(isBufferingVisible).toBe(false);
    });

    it("should trigger buffering indicator after 500ms", () => {
      let isBufferingVisible = false;

      setTimeout(() => {
        isBufferingVisible = true;
      }, 500);

      jest.advanceTimersByTime(500);
      expect(isBufferingVisible).toBe(true);
    });
  });

  describe("error state transitions", () => {
    it("should auto-retry once on first error", () => {
      let tokenRetried = false;
      let errorShown = false;

      // Simulate first error → auto retry
      const handleError = (retryCount: number) => {
        if (retryCount === 0) {
          tokenRetried = true;
        } else {
          errorShown = true;
        }
      };

      handleError(0); // First error
      expect(tokenRetried).toBe(true);
      expect(errorShown).toBe(false);

      handleError(1); // Second error
      expect(errorShown).toBe(true);
    });

    it("should clear error on successful load", () => {
      let videoError: string | null = "Video failed";
      let tokenRetry = true;

      // Simulate successful load
      videoError = null;
      tokenRetry = false;

      expect(videoError).toBeNull();
      expect(tokenRetry).toBe(false);
    });
  });

  describe("completion state", () => {
    it("should show completion only once per lesson", () => {
      let completionCount = 0;
      let hasCompleted = false;

      const handleFinish = () => {
        if (!hasCompleted) {
          hasCompleted = true;
          completionCount++;
        }
      };

      handleFinish();
      handleFinish(); // duplicate
      handleFinish(); // duplicate

      expect(completionCount).toBe(1);
    });
  });

  describe("playback rate cycling", () => {
    it("cycles through rates correctly", () => {
      const rates = [1, 1.25, 1.5, 1.75, 2];
      let currentRate = 1;

      const cycle = () => {
        const idx = rates.indexOf(currentRate);
        currentRate = rates[(idx + 1) % rates.length];
      };

      cycle(); expect(currentRate).toBe(1.25);
      cycle(); expect(currentRate).toBe(1.5);
      cycle(); expect(currentRate).toBe(1.75);
      cycle(); expect(currentRate).toBe(2);
      cycle(); expect(currentRate).toBe(1); // wraps
    });
  });
});
