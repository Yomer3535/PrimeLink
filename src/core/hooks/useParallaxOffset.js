import { useState, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Returns { xAnim, yAnim } for parallax glow behind the Gem.
 * Uses Accelerometer from expo-sensors when available (tilt = parallax);
 * otherwise falls back to gentle time-based drift.
 */
export function useParallaxOffset(sensitivity = 25) {
  const xAnim = useState(() => new Animated.Value(0))[0];
  const yAnim = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    let subscription = null;
    let cancelled = false;
    try {
      const { Accelerometer } = require("expo-sensors");
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(({ x, y }) => {
        const dx = Math.max(-1, Math.min(1, y * sensitivity));
        const dy = Math.max(-1, Math.min(1, -x * sensitivity));
        Animated.parallel([
          Animated.timing(xAnim, { toValue: dx, duration: 80, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: dy, duration: 80, useNativeDriver: true }),
        ]).start();
      });
    } catch (_) {
      // Fallback: gentle animated drift when expo-sensors not available
      const drift = () => {
        if (cancelled) return;
        Animated.sequence([
          Animated.timing(xAnim, { toValue: 0.15, duration: 2000, useNativeDriver: true }),
          Animated.timing(xAnim, { toValue: -0.15, duration: 2000, useNativeDriver: true }),
        ]).start(() => drift());
      };
      const driftY = () => {
        if (cancelled) return;
        Animated.sequence([
          Animated.timing(yAnim, { toValue: 0.1, duration: 2500, useNativeDriver: true }),
          Animated.timing(yAnim, { toValue: -0.1, duration: 2500, useNativeDriver: true }),
        ]).start(() => driftY());
      };
      drift();
      driftY();
    }
    return () => {
      cancelled = true;
      subscription?.remove?.();
    };
  }, []);

  return { xAnim, yAnim };
}
