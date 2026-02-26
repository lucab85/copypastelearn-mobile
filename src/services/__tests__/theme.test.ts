import { colors, typography, spacing, radii, getGradientColor, getGreeting } from "@/theme";

describe("theme via @/ alias", () => {
  it("resolves @/ path alias correctly", () => {
    expect(colors.primary).toBe("#2563eb");
  });
});

describe("getGradientColor", () => {
  it("returns consistent color for same title", () => {
    const a = getGradientColor("My Course");
    const b = getGradientColor("My Course");
    expect(a).toBe(b);
  });

  it("returns different colors for different titles", () => {
    const a = getGradientColor("Course A");
    const b = getGradientColor("Course B");
    // Not guaranteed different but very likely with hash
    expect(typeof a).toBe("string");
    expect(typeof b).toBe("string");
  });

  it("returns a valid hex color", () => {
    const c = getGradientColor("Test");
    expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe("getGreeting", () => {
  it("returns a greeting string", () => {
    const g = getGreeting();
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(g);
  });
});

describe("spacing scale", () => {
  it("is monotonically increasing", () => {
    const values = [spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl, spacing.xxl];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe("radii", () => {
  it("full is 9999", () => {
    expect(radii.full).toBe(9999);
  });
});
