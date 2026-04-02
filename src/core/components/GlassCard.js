import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

/**
 * Glassmorphism 2.0 card:
 *  - Outer gradient border (bright top → dim bottom, 0.5px feel)
 *  - Blurred glass surface
 *  - Subtle inner shadow for depth
 */
export function GlassCard({ style, children }) {
  return (
    <View style={[styles.outer, style]}>
      {/* Gradient border layer */}
      <LinearGradient
        colors={[colors.borderTop, colors.borderBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.borderGradient}
      />
      {/* Glass surface */}
      <BlurView tint="dark" intensity={30} style={styles.blur}>
        <View style={styles.inner}>
          {/* Inner shadow (top light) */}
          <LinearGradient
            colors={["rgba(255,255,255,0.04)", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.innerShadow}
            pointerEvents="none"
          />
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  blur: {
    margin: 1, // creates the gradient-border effect
    borderRadius: 19,
    overflow: "hidden",
  },
  inner: {
    backgroundColor: "rgba(8,10,18,0.75)",
    padding: 16,
    borderRadius: 19,
  },
  innerShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
});
