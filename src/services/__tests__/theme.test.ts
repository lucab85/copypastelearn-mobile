import { colors, typography, spacing, radii } from "../../theme";

// Test pure functions only — theme tokens are just constants
// RN-dependent parts (shadows, StyleSheet) aren't tested here

describe("theme tokens", () => {
  it("exports color tokens", () => {
    expect(colors.primary).toBe("#2563eb");
    expect(colors.accent).toBe("#f59e0b");
    expect(colors.success).toBe("#16a34a");
    expect(colors.error).toBe("#dc2626");
    expect(colors.text).toBe("#0f172a");
    expect(colors.background).toBe("#f8fafc");
  });

  it("exports typography scale", () => {
    expect(typography.h1.fontSize).toBe(28);
    expect(typography.body.fontSize).toBe(15);
    expect(typography.caption.fontSize).toBe(12);
  });

  it("exports spacing scale", () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
  });

  it("exports border radii", () => {
    expect(radii.sm).toBe(8);
    expect(radii.full).toBe(9999);
  });
});
