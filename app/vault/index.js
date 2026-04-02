import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors } from "../../src/theme/colors";
import { GlassCard } from "../../src/core/components/GlassCard";
import { PrimaryButton } from "../../src/core/components/PrimaryButton";
import { RelationshipPulse } from "../../src/core/components/RelationshipPulse";
import { RingBudgetChart } from "../../src/core/components/RingBudgetChart";
import { TimeCapsuleOrbs } from "../../src/core/components/TimeCapsuleOrbs";
import { NextEventCard } from "../../src/core/components/NextEventCard";
import { useAppState } from "../../src/core/state/AppStateProvider";
import { loadEvents } from "../../src/core/storage/persistence";

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", TRY: "₺" };
const MONTHLY_BUDGET = 2000;
const MONTHLY_SPENT = 1330;
const MONTHLY_SAVED = 450;
const CATEGORIES = [
  { key: "partner", label: "Partner", color: colors.gemElectricBlue, pct: 42 },
  { key: "family", label: "Family", color: colors.neonCyan, pct: 18 },
  { key: "friends", label: "Friends", color: colors.gemSunsetOrange, pct: 22 },
  { key: "business", label: "Business", color: colors.neonPurple, pct: 18 },
];

function CategoryDonut() {
  return (
    <View style={donutStyles.row}>
      {CATEGORIES.map((c) => (
        <View
          key={c.key}
          style={[
            donutStyles.segment,
            {
              flex: c.pct,
              backgroundColor: c.color,
              borderTopLeftRadius: c.key === CATEGORIES[0].key ? 6 : 0,
              borderBottomLeftRadius: c.key === CATEGORIES[0].key ? 6 : 0,
              borderTopRightRadius: c.key === CATEGORIES[CATEGORIES.length - 1].key ? 6 : 0,
              borderBottomRightRadius: c.key === CATEGORIES[CATEGORIES.length - 1].key ? 6 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
}

const donutStyles = StyleSheet.create({
  row: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", backgroundColor: colors.surface },
  segment: {},
});

export default function FinancialVaultPage() {
  const { isPremium, currency } = useAppState();
  const router = useRouter();
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const pct = Math.min(100, (MONTHLY_SPENT / MONTHLY_BUDGET) * 100);
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    loadEvents().then((events) => {
      if (Array.isArray(events) && events.length > 0) {
        const upcoming = events
          .map((e) => ({ ...e, date: new Date(e.date) }))
          .filter((e) => e.date >= new Date())
          .sort((a, b) => a.date - b.date);
        setNextEvent(upcoming[0] ?? events[events.length - 1]);
      }
    });
  }, []);

  return (
    <View style={s.container}>
      <LinearGradient
        colors={["transparent", "rgba(168,85,247,0.03)", "transparent"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Text style={s.title}>Vault</Text>
      <Text style={s.subtitle}>Relationship black box</Text>

      {/* Biometric-style entry icon */}
      <View style={s.biometricWrap}>
        <View style={s.biometricRingOuter} />
        <View style={s.biometricRingMid} />
        <View style={s.biometricIcon}>
          <Text style={s.biometricEmoji}>🔐</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {nextEvent && (
          <NextEventCard
            event={nextEvent}
            onPress={() => router.push("/")}
            currencySym={sym}
          />
        )}

        <GlassCard style={s.card}>
          <Text style={s.cardTitle}>Shared Budget</Text>
          <RingBudgetChart
            spent={MONTHLY_SPENT}
            budget={MONTHLY_BUDGET}
            saved={MONTHLY_SAVED}
            currencySym={sym}
          />
        </GlassCard>

        <GlassCard style={s.card}>
          <RelationshipPulse label="Relationship Pulse" />
          <Text style={s.cardTitle}>Category breakdown</Text>
          <CategoryDonut />
          <View style={s.legend}>
            {CATEGORIES.map((c) => (
              <View key={c.key} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: c.color }]} />
                <Text style={s.legendText}>{c.label} %{c.pct}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={s.card}>
          <TimeCapsuleOrbs />
        </GlassCard>

        <GlassCard style={s.card}>
          <Text style={s.cardTitle}>This month's spending</Text>
          <Text style={s.cardText}>
            {sym}{MONTHLY_SPENT.toLocaleString()} / {sym}{MONTHLY_BUDGET.toLocaleString()}
          </Text>
          <View style={s.progressOuter}>
            <LinearGradient
              colors={[colors.gemElectricBlue, colors.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${pct}%` }]}
            />
          </View>
        </GlassCard>
      </ScrollView>

      {!isPremium && (
        <View style={s.overlayWrap}>
          <BlurView tint="dark" intensity={95} style={s.overlayBlur} />
          <View style={s.overlayContent}>
            <PrimaryButton label="Unlock Premium" onPress={() => router.push("/paywall")} style={s.overlayButton} />
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 64 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 20 },
  biometricWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  biometricRingOuter: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(168,85,247,0.5)",
    shadowColor: colors.neonPurple,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  biometricRingMid: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: "rgba(59,130,246,0.6)",
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  biometricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  biometricEmoji: { fontSize: 22 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  card: { marginBottom: 20 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardText: { color: colors.textSecondary, fontSize: 14, marginBottom: 12 },
  progressOuter: {
    height: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  progressFill: {
    height: 10,
    borderRadius: 8,
  },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 },
  legendRow: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendText: { color: colors.textSecondary, fontSize: 13 },
  overlayWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  overlayBlur: { ...StyleSheet.absoluteFillObject },
  overlayContent: { position: "absolute", justifyContent: "center", alignItems: "center", padding: 24 },
  overlayButton: { minWidth: 220 },
});
