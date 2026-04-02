import { View, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useMemo } from "react";
import { colors } from "../../theme/colors";
import { useParallaxOffset } from "../hooks/useParallaxOffset";

/**
 * urgency: number of days until next event
 *   0     → fire orange/red (urgent!)
 *   1-3   → warm amber/purple
 *   4+    → calm blue/cyan (default)
 *   null  → serene blue
 */
function urgencyPalette(urgency) {
  if (urgency === 0) {
    return {
      layer1: ["#F97316", "#EF4444", "#DC2626"],
      layer2: ["#FBBF24", "#F97316", "#EC4899"],
      layer3: ["#FB923C", "#F43F5E", "#E11D48"],
      glow: "#F97316",
    };
  }
  if (urgency !== null && urgency <= 3) {
    return {
      layer1: ["#F97316", "#A855F7", "#7C3AED"],
      layer2: ["#FBBF24", "#EC4899", "#A855F7"],
      layer3: ["#FB923C", "#C084FC", "#8B5CF6"],
      glow: "#A855F7",
    };
  }
  return {
    layer1: ["#38BDF8", "#818CF8", "#A855F7"],
    layer2: ["#22D3EE", "#3B82F6", "#6366F1"],
    layer3: ["#06B6D4", "#0EA5E9", "#38BDF8"],
    glow: "#38BDF8",
  };
}

export function Gem({ size = 110, urgency = null }) {
  const outerSize = size * 1.6;
  const palette = useMemo(() => urgencyPalette(urgency), [urgency]);
  const { xAnim, yAnim } = useParallaxOffset(20);

  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;
  const glowOp = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const speed = urgency === 0 ? 0.7 : urgency !== null && urgency <= 3 ? 0.85 : 1;

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale1, { toValue: 1.10, duration: 3200 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rot1, { toValue: 1, duration: 3200 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale1, { toValue: 1, duration: 3200 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rot1, { toValue: 0, duration: 3200 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale2, { toValue: 1.06, duration: 2400 * speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot2, { toValue: 1, duration: 2400 * speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale2, { toValue: 0.96, duration: 2400 * speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(rot2, { toValue: 0, duration: 2400 * speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale3, { toValue: 1.05, duration: 1800 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rot3, { toValue: 1, duration: 1800 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale3, { toValue: 0.97, duration: 1800 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rot3, { toValue: 0, duration: 1800 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 0.7, duration: 2600 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.25, duration: 2600 * speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [scale1, scale2, scale3, rot1, rot2, rot3, glowOp, urgency]);

  const rotate1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "14deg"] });
  const rotate2 = rot2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-20deg"] });
  const rotate3 = rot3.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "28deg"] });

  const b1 = size * 0.52, b1h = size * 0.44;
  const b2 = size * 0.46, b2h = size * 0.50;
  const b3 = size * 0.40, b3h = size * 0.48;

  const translateX = xAnim.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });
  const translateY = yAnim.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] });

  return (
    <View style={[styles.halo, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}>
      {/* Parallax glow — shifts with device tilt */}
      <Animated.View
        style={[
          styles.parallaxGlow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            opacity: 0.3,
            shadowColor: palette.glow,
            transform: [{ translateX }, { translateY }],
          },
        ]}
      />
      {/* Deep glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.35,
            height: size * 1.35,
            borderRadius: size * 0.675,
            opacity: glowOp,
            shadowColor: palette.glow,
          },
        ]}
      />

      {/* Layer 3 */}
      <Animated.View style={[styles.blobLayer, { transform: [{ scale: scale3 }, { rotate: rotate3 }], shadowColor: palette.glow }]}>
        <LinearGradient
          colors={palette.layer3}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: b3 * 2, height: b3h * 2,
            borderTopLeftRadius: b3 * 0.9, borderTopRightRadius: b3 * 0.55,
            borderBottomLeftRadius: b3 * 0.65, borderBottomRightRadius: b3 * 1.15,
            opacity: 0.55,
          }}
        />
      </Animated.View>

      {/* Layer 2 */}
      <Animated.View style={[styles.blobLayer, { transform: [{ scale: scale2 }, { rotate: rotate2 }], shadowColor: palette.glow }]}>
        <LinearGradient
          colors={palette.layer2}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            width: b2 * 2, height: b2h * 2,
            borderTopLeftRadius: b2 * 0.65, borderTopRightRadius: b2 * 1.1,
            borderBottomLeftRadius: b2 * 1.05, borderBottomRightRadius: b2 * 0.45,
            opacity: 0.5,
          }}
        />
      </Animated.View>

      {/* Layer 1 — primary */}
      <Animated.View style={[styles.blobLayer, { transform: [{ scale: scale1 }, { rotate: rotate1 }], shadowColor: palette.glow }]}>
        <LinearGradient
          colors={palette.layer1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: b1 * 2, height: b1h * 2,
            borderTopLeftRadius: b1 * 1.15, borderTopRightRadius: b1 * 0.55,
            borderBottomLeftRadius: b1 * 0.45, borderBottomRightRadius: b1 * 0.95,
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  parallaxGlow: {
    position: "absolute",
    backgroundColor: "transparent",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 60,
  },
  glowRing: {
    position: "absolute",
    backgroundColor: "rgba(56,189,248,0.04)",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 50,
  },
  blobLayer: {
    position: "absolute",
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 28,
  },
});
