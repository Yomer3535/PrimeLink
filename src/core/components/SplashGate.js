import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

/* ── Splash palette: Electric Blue, Deep Purple, Neon Cyan ── */
const SPLASH_COLORS = {
  electricBlue: "#3B82F6",
  deepPurple: "#7C3AED",
  neonCyan: "#22D3EE",
};

/**
 * Cinematic splash: lava-lamp fluid morphing gem, then "PRIMELINK" serif fade-in.
 * Pure black (#000000) background. Organic asymmetric gem with flowing colors.
 */
export function SplashGate({ children }) {
  const [done, setDone] = useState(false);

  const gemOpacity = useRef(new Animated.Value(0)).current;
  const gemScale = useRef(new Animated.Value(0.4)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(12)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const morph1 = useRef(new Animated.Value(0)).current;
  const morph2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fluid morphing loop (lava lamp)
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rot1, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale1, { toValue: 1.12, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(morph1, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(rot1, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale1, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(morph1, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ]),
      { iterations: -1 }
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rot2, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale2, { toValue: 1.08, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(rot2, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale2, { toValue: 0.95, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
      { iterations: -1 }
    );
    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rot3, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale3, { toValue: 1.06, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(morph2, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(rot3, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale3, { toValue: 0.97, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(morph2, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ]),
      { iterations: -1 }
    );

    // Main sequence: gem scales up slowly, text fades in
    Animated.sequence([
      Animated.parallel([
        Animated.timing(gemOpacity, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(gemScale, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.delay(600),
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
      setDone(true);
    });

    loop1.start();
    loop2.start();
    loop3.start();
    return () => { loop1.stop(); loop2.stop(); loop3.stop(); };
  }, []);

  const r1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "22deg"] });
  const r2 = rot2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-18deg"] });
  const r3 = rot3.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "32deg"] });

  const m1 = morph1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.05] });
  const m2 = morph2.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.1] });

  if (done) return children;

  const serifFont = Platform.select({ ios: "Georgia", android: "serif", default: "serif" });

  return (
    <View style={styles.root}>
      {children}
      <Animated.View style={[styles.overlay, { opacity: containerOpacity }]}>
        <View style={styles.center}>
          <Animated.View
            style={{
              opacity: gemOpacity,
              transform: [{ scale: gemScale }],
            }}
          >
            <View style={styles.gemContainer}>
              {/* Layer 3 — cyan/purple */}
              <Animated.View
                style={[
                  styles.blobLayer,
                  {
                    transform: [{ scale: scale3 }, { rotate: r3 }],
                    shadowColor: SPLASH_COLORS.neonCyan,
                    opacity: m2,
                  },
                ]}
              >
                <LinearGradient
                  colors={[SPLASH_COLORS.neonCyan, SPLASH_COLORS.deepPurple]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={[styles.blob3, { borderTopLeftRadius: 28, borderTopRightRadius: 18, borderBottomLeftRadius: 22, borderBottomRightRadius: 30 }]}
                />
              </Animated.View>
              {/* Layer 2 — purple/blue */}
              <Animated.View
                style={[
                  styles.blobLayer,
                  {
                    transform: [{ scale: scale2 }, { rotate: r2 }],
                    shadowColor: SPLASH_COLORS.deepPurple,
                    opacity: m1,
                  },
                ]}
              >
                <LinearGradient
                  colors={[SPLASH_COLORS.deepPurple, SPLASH_COLORS.electricBlue]}
                  start={{ x: 0, y: 0.3 }}
                  end={{ x: 1, y: 0.7 }}
                  style={[styles.blob2, { borderTopLeftRadius: 24, borderTopRightRadius: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 18 }]}
                />
              </Animated.View>
              {/* Layer 1 — primary blue/cyan */}
              <Animated.View
                style={[
                  styles.blobLayer,
                  {
                    transform: [{ scale: scale1 }, { rotate: r1 }],
                    shadowColor: SPLASH_COLORS.electricBlue,
                  },
                ]}
              >
                <LinearGradient
                  colors={[SPLASH_COLORS.electricBlue, SPLASH_COLORS.neonCyan]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.blob1}
                />
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textSlide }],
            }}
          >
            <Text style={[styles.brandName, { fontFamily: serifFont }]}>
              PRIMELINK
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  center: { alignItems: "center" },
  gemContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  blobLayer: {
    position: "absolute",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 36,
  },
  blob1: {
    width: 72,
    height: 72,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 34,
  },
  blob2: {
    width: 64,
    height: 68,
  },
  blob3: {
    width: 56,
    height: 60,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 8,
    marginTop: 32,
  },
});
