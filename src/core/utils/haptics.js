/**
 * Light haptic feedback for button presses and tab switches.
 * Uses expo-haptics when available; no-op otherwise.
 */
let Haptics = null;
try {
  Haptics = require("expo-haptics");
} catch (_) {
  Haptics = null;
}

export function lightTap() {
  if (Haptics?.impactAsync) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function selectionChange() {
  if (Haptics?.selectionAsync) {
    Haptics.selectionAsync().catch(() => {});
  }
}
