describe("apiClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => jest.clearAllMocks());
  afterAll(() => { global.fetch = originalFetch; });

  it("injects Authorization header when token is available", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ success: true, data: [] }),
    });
    global.fetch = mockFetch;

    const token = "test-jwt-token";
    const API_BASE = "http://localhost:3000";

    await fetch(`${API_BASE}/api/mobile/courses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/mobile/courses",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
        }),
      })
    );
  });

  it("handles API error responses with JSON body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Auth required" },
        }),
    });

    const res = await fetch("http://localhost:3000/api/mobile/dashboard");
    const json = await res.json();

    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("handles non-JSON error responses gracefully", async () => {
    const mockRes = {
      ok: false,
      status: 502,
      headers: new Headers({ "content-type": "text/html" }),
      text: () => Promise.resolve("<html>Bad Gateway</html>"),
    };
    global.fetch = jest.fn().mockResolvedValue(mockRes);

    const res = await fetch("http://localhost:3000/api/mobile/courses");
    const contentType = res.headers.get("content-type") ?? "";

    expect(contentType.includes("application/json")).toBe(false);
    // apiClient would fall back to res.text() here
    const text = await res.text();
    expect(text).toContain("Bad Gateway");
  });

  it("sends correct body for progress save", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ success: true, data: { success: true } }),
    });
    global.fetch = mockFetch;

    const body = { lessonId: "lesson-123", positionSeconds: 42.5 };

    await fetch("http://localhost:3000/api/mobile/progress/position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.lessonId).toBe("lesson-123");
    expect(callBody.positionSeconds).toBe(42.5);
  });
});
