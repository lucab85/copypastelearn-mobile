// Safe haptics wrapper — no crash if unavailable
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {
  // Haptics unavailable
}

export function hapticLight() {
  try { Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export function hapticMedium() {
  try { Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

export function hapticSuccess() {
  try { Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success); } catch {}
}

export function hapticError() {
  try { Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Error); } catch {}
}

export function hapticSelection() {
  try { Haptics?.selectionAsync?.(); } catch {}
}
