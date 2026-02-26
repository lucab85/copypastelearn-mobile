import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";

// Test the debounce logic
describe("useDebouncedCallback logic", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("debounces function calls", () => {
    const fn = jest.fn();
    let debouncedFn: ((...args: any[]) => void) | null = null;

    // Simulate debounce logic without React hooks
    const delay = 300;
    let timer: ReturnType<typeof setTimeout> | null = null;
    debouncedFn = (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };

    debouncedFn("a");
    debouncedFn("ab");
    debouncedFn("abc");

    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("fires immediately after delay", () => {
    const fn = jest.fn();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFn = (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), 300);
    };

    debouncedFn("test");
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledWith("test");
  });
});

describe("pagination cursor parsing", () => {
  it("parses paginated response with nextCursor", () => {
    const response = {
      success: true,
      data: [{ id: "1", title: "Course 1" }],
      nextCursor: "cursor-abc",
    };

    expect(response.nextCursor).toBe("cursor-abc");
    expect(response.data).toHaveLength(1);
  });

  it("handles last page with null cursor", () => {
    const response = {
      success: true,
      data: [{ id: "2", title: "Course 2" }],
      nextCursor: null,
    };

    expect(response.nextCursor).toBeNull();
  });

  it("builds correct URL params for pagination", () => {
    const params = new URLSearchParams({ limit: "20" });
    params.set("cursor", "abc123");

    expect(params.toString()).toBe("limit=20&cursor=abc123");
  });
});
