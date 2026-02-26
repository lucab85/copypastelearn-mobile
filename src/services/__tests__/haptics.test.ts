import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticSelection } from "@/services/haptics";

describe("haptics service", () => {
  it("exports all haptic functions", () => {
    expect(typeof hapticLight).toBe("function");
    expect(typeof hapticMedium).toBe("function");
    expect(typeof hapticSuccess).toBe("function");
    expect(typeof hapticError).toBe("function");
    expect(typeof hapticSelection).toBe("function");
  });

  it("does not throw when called without expo-haptics", () => {
    // In test env, expo-haptics is not available
    expect(() => hapticLight()).not.toThrow();
    expect(() => hapticMedium()).not.toThrow();
    expect(() => hapticSuccess()).not.toThrow();
    expect(() => hapticError()).not.toThrow();
    expect(() => hapticSelection()).not.toThrow();
  });
});
