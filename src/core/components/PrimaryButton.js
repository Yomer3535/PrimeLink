import { Pressable, Text, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { lightTap } from "../utils/haptics";

/**
 * Glass-effect button with 30px rounded corners.
 * Subtle gradient border + blur surface + press micro-animation + haptic feedback.
 */
export function PrimaryButton({ label, onPress, style, disabled }) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          lightTap();
          onPress?.();
        }
      }}
      style={({ pressed }) => [
        styles.outer,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.borderTop, "rgba(59,130,246,0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      />
      <BlurView tint="dark" intensity={20} style={styles.blur}>
        <View style={styles.inner}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  blur: {
    margin: 1,
    borderRadius: 29,
    overflow: "hidden",
  },
  inner: {
    backgroundColor: "rgba(59,130,246,0.55)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
