import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { lightTap } from "../utils/haptics";
import { Ionicons } from "@expo/vector-icons";

const BUDGET_OPTIONS = [
  { key: "low", label: "Low ($0–100)", max: 100 },
  { key: "mid", label: "Mid ($100–300)", min: 100, max: 300 },
  { key: "high", label: "High ($300+)", min: 300 },
];

const MOOD_OPTIONS = [
  { key: "romantic", label: "Romantic", icon: "heart" },
  { key: "adventure", label: "Adventure", icon: "compass" },
  { key: "athome", label: "At Home", icon: "home" },
  { key: "chill", label: "Chill", icon: "cafe" },
  { key: "surprise", label: "Surprise", icon: "sparkles" },
];

const DATE_IDEAS = [
  { mood: "romantic", budget: "low", title: "Candlelit dinner at home", desc: "Cook yourself, light candles, prepare a playlist" },
  { mood: "romantic", budget: "low", title: "Park sunset", desc: "Grab coffee, sit on a bench, talk" },
  { mood: "romantic", budget: "mid", title: "Picnic + wine", desc: "Blanket, cheese, fruit, great view" },
  { mood: "romantic", budget: "mid", title: "Cinema + night walk", desc: "Quiet film, then explore the city" },
  { mood: "romantic", budget: "high", title: "Fancy restaurant reservation", desc: "Special menu, live music" },
  { mood: "adventure", budget: "low", title: "New neighborhood explore", desc: "Bike or walk to a new area" },
  { mood: "adventure", budget: "low", title: "Escape room", desc: "One room, one hour, solve together" },
  { mood: "adventure", budget: "mid", title: "High ropes / climbing", desc: "Adventure park or hiking" },
  { mood: "adventure", budget: "mid", title: "Kayak / canoe tour", desc: "Lake or river explore" },
  { mood: "adventure", budget: "high", title: "Skydive / dive", desc: "Unforgettable adrenaline experience" },
  { mood: "athome", budget: "low", title: "Film marathon", desc: "Pick a favorite series, cozy up" },
  { mood: "athome", budget: "low", title: "Game night", desc: "Board game or video game" },
  { mood: "athome", budget: "mid", title: "Cooking class together", desc: "Try a new recipe from YouTube" },
  { mood: "athome", budget: "mid", title: "Home spa day", desc: "Massage, bath, aromatherapy" },
  { mood: "athome", budget: "high", title: "Private chef at home", desc: "Chef menu, candles, music" },
  { mood: "chill", budget: "low", title: "Coffee break + bookstore", desc: "Cozy café, then browse shelves" },
  { mood: "chill", budget: "low", title: "Vintage market tour", desc: "Secondhand treasure hunt" },
  { mood: "chill", budget: "mid", title: "Brunch + exhibition", desc: "Nice breakfast, then museum/gallery" },
  { mood: "chill", budget: "mid", title: "Jazz bar", desc: "Live music, cocktails" },
  { mood: "chill", budget: "high", title: "Wellness day", desc: "Spa, massage, pool" },
  { mood: "surprise", budget: "low", title: "Secret date", desc: "Partner picks, you follow" },
  { mood: "surprise", budget: "low", title: "Spontaneous trip", desc: "Hop on a bus, get off randomly" },
  { mood: "surprise", budget: "mid", title: "Pop-up experience", desc: "Explore what's in town this week" },
  { mood: "surprise", budget: "mid", title: "Gift + venue", desc: "Small gift at a surprise spot" },
  { mood: "surprise", budget: "high", title: "Weekend getaway", desc: "1 night nearby city, surprise plan" },
];

function filterIdeas(budgetKey, moodKey) {
  return DATE_IDEAS.filter(
    (i) =>
      i.budget === budgetKey &&
      (moodKey === "all" || i.mood === moodKey)
  );
}

export function DateNightRouletteModal({ visible, onClose }) {
  const [budget, setBudget] = useState("mid");
  const [mood, setMood] = useState("all");
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const filtered = filterIdeas(budget, mood);
  const ideas = filtered.length > 0 ? filtered : DATE_IDEAS;

  function handleSpin() {
    if (spinning || ideas.length === 0) return;
    lightTap();
    setSpinning(true);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * ideas.length);
    const selected = ideas[randomIndex];
    const spins = 3 + Math.random() * 2;
    const totalRotation = spins * 360 + (360 / ideas.length) * randomIndex;

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      setResult(selected);
      setSpinning(false);
    });

    const listenerId = spinAnim.addListener(({ value }) => {
      if (value >= 1) spinAnim.removeListener(listenerId);
    });
  }

  const rotateInterp = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1800deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.content} onPress={(e) => e.stopPropagation()}>
          <GlassCard style={s.card}>
            <View style={s.header}>
              <Text style={s.title}>Date Night Roulette</Text>
              <Pressable onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={s.subtitle}>Budget & Mood</Text>
            <View style={s.chips}>
              {BUDGET_OPTIONS.map((b) => (
                <Pressable
                  key={b.key}
                  onPress={() => { lightTap(); setBudget(b.key); setResult(null); }}
                  style={[s.chip, budget === b.key && s.chipActive]}
                >
                  <Text style={[s.chipText, budget === b.key && s.chipTextActive]}>{b.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.chips}>
              <Pressable
                onPress={() => { lightTap(); setMood("all"); setResult(null); }}
                style={[s.chip, mood === "all" && s.chipActive]}
              >
                <Text style={[s.chipText, mood === "all" && s.chipTextActive]}>All</Text>
              </Pressable>
              {MOOD_OPTIONS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => { lightTap(); setMood(m.key); setResult(null); }}
                  style={[s.chip, mood === m.key && s.chipActive]}
                >
                  <Ionicons name={m.icon} size={14} color={mood === m.key ? "#fff" : colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[s.chipText, mood === m.key && s.chipTextActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={s.wheelWrap}>
              <Animated.View style={[s.wheel, { transform: [{ rotate: spinning ? rotateInterp : "0deg" }] }]}>
                <LinearGradient
                  colors={[colors.neonPurple, colors.gemElectricBlue, colors.neonPink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.wheelGrad}
                />
                <View style={s.wheelCenter} />
              </Animated.View>
              <View style={s.pointer} />
            </View>

            <Pressable
              onPress={handleSpin}
              disabled={spinning}
              style={[s.spinBtn, spinning && s.spinBtnDisabled]}
            >
              <Text style={s.spinBtnText}>{spinning ? "Spinning..." : "Spin"}</Text>
            </Pressable>

            {result && !spinning && (
              <View style={s.result}>
                <Text style={s.resultTitle}>{result.title}</Text>
                <Text style={s.resultDesc}>{result.desc}</Text>
              </View>
            )}
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: { width: "100%", maxWidth: 380 },
  card: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  chipActive: { backgroundColor: "rgba(168,85,247,0.4)", borderWidth: 1, borderColor: colors.neonPurple },
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  wheelWrap: { alignItems: "center", marginVertical: 20, position: "relative" },
  wheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  wheelGrad: { flex: 1, borderRadius: 60, opacity: 0.9 },
  wheelCenter: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    top: 45,
    left: 45,
  },
  pointer: {
    position: "absolute",
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.neonPink,
  },
  spinBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.neonPurple,
    alignItems: "center",
    marginBottom: 12,
  },
  spinBtnDisabled: { opacity: 0.6 },
  spinBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  result: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(168,85,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.3)",
  },
  resultTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 6 },
  resultDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
