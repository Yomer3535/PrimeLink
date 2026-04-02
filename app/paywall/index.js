import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme/colors";
import { GlassCard } from "../../src/core/components/GlassCard";
import { PrimaryButton } from "../../src/core/components/PrimaryButton";
import { useAppState } from "../../src/core/state/AppStateProvider";

const FEATURES = [
  {
    title: "Unlimited connections",
    desc: "Track every person who matters, without limits.",
  },
  {
    title: "Full analytics suite",
    desc: "Donut breakdowns, 6-month trends, and interactive charts.",
  },
  {
    title: "Biometric security",
    desc: "Lock your private vault with Face ID or Touch ID.",
  },
  {
    title: "Priority support",
    desc: "Direct line to the PrimeLink team when you need help.",
  },
];

export default function PaywallPage() {
  const router = useRouter();
  const { setIsPremium } = useAppState();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const gemScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(gemScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp, gemScale]);

  function handleUnlock() {
    setIsPremium(true);
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* Blurred background tint */}
      <BlurView tint="dark" intensity={90} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        {/* Decorative gem accent */}
        <View style={styles.gemRow}>
          <Animated.View style={{ transform: [{ scale: gemScale }] }}>
            <LinearGradient
              colors={["#38BDF8", "#818CF8", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.miniGem}
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock everything PrimeLink has to offer. Your relationships deserve
          the full experience.
        </Text>

        {/* Feature cards */}
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <GlassCard key={i} style={styles.featureCard}>
              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: i === 0 ? colors.gemElectricBlue : i === 1 ? colors.gemEmeraldGreen : i === 2 ? colors.gemSunsetOrange : "#818CF8" }]} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Pricing */}
        <GlassCard style={styles.priceCard}>
          <Text style={styles.priceLabel}>PrimeLink Premium</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>$4.99</Text>
            <Text style={styles.pricePeriod}> / month</Text>
          </View>
          <Text style={styles.priceNote}>
            Cancel anytime. 7-day free trial included.
          </Text>
        </GlassCard>

        <PrimaryButton
          label="Start free trial"
          onPress={handleUnlock}
          style={styles.cta}
        />

        <PrimaryButton
          label="Maybe later"
          onPress={() => router.back()}
          style={[styles.cta, styles.ctaSecondary]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    justifyContent: "center",
  },

  /* Gem accent */
  gemRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  miniGem: {
    width: 56,
    height: 56,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 26,
    shadowColor: "#818CF8",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },

  /* Typography */
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },

  /* Feature list */
  featureList: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  featureDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  /* Price */
  priceCard: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 24,
    borderColor: colors.gemElectricBlue,
    borderWidth: 1,
  },
  priceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "700",
  },
  pricePeriod: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  priceNote: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  /* CTA */
  cta: {
    marginBottom: 10,
  },
  ctaSecondary: {
    backgroundColor: colors.surface,
  },
});
