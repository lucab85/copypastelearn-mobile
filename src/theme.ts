import { StyleSheet, Platform } from "react-native";

// ─── Colors ───────────────────────────────────────────────
export const colors = {
  // Primary
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  primaryDark: "#1d4ed8",
  primaryBg: "#eff6ff",

  // Accent
  accent: "#f59e0b",
  accentLight: "#fbbf24",
  accentDark: "#d97706",

  // Success
  success: "#16a34a",
  successLight: "#22c55e",
  successBg: "#f0fdf4",

  // Error
  error: "#dc2626",
  errorLight: "#ef4444",
  errorBg: "#fef2f2",

  // Warning
  warning: "#ea580c",
  warningBg: "#fff7ed",

  // Neutrals
  white: "#ffffff",
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",

  // Text
  text: "#0f172a",
  textSecondary: "#475569",
  textTertiary: "#94a3b8",
  textInverse: "#ffffff",

  // Misc
  overlay: "rgba(0,0,0,0.6)",
  skeleton: "#e2e8f0",
  skeletonHighlight: "#f1f5f9",
};

// ─── Typography ───────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  h4: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  bodySm: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "500" as const },
  captionSm: { fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: "600" as const },
  buttonSm: { fontSize: 14, fontWeight: "600" as const },
};

// ─── Spacing ──────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radii ─────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────
export const shadows = StyleSheet.create({
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }) as any,
  elevated: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }) as any,
  subtle: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }) as any,
});

// ─── Gradients (deterministic from string hash) ───────────
const GRADIENT_PAIRS = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
  ["#fccb90", "#d57eeb"],
  ["#e0c3fc", "#8ec5fc"],
  ["#f6d365", "#fda085"],
  ["#a1c4fd", "#c2e9fb"],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGradientColors(title: string): [string, string] {
  const idx = hashString(title) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx] as [string, string];
}

export function getGradientColor(title: string): string {
  return getGradientColors(title)[0];
}

// ─── Common Styles ────────────────────────────────────────
export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primaryBg,
  },
  pillText: {
    ...typography.caption,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

// ─── Helpers ──────────────────────────────────────────────
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
