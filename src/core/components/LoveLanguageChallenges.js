import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "../utils/haptics";

const LOVE_LANG_CHALLENGES = {
  "Words of Affirmation": [
    "Give them 3 sincere compliments today",
    "Write down their strengths and share",
    "Say something kind when they wake up",
    "Specifically mention what you're thankful for",
  ],
  "Quality Time": [
    "Spend 30 minutes phone-free together",
    "Try a new activity together",
    "Take a night walk, just talk",
    "Watch their favorite film together",
  ],
  "Receiving Gifts": [
    "Pick up their favorite snack on the way home",
    "Leave a small surprise gift",
    "Remember and get something they wanted",
    "Make a handmade gift",
  ],
  "Acts of Service": [
    "Do a chore for them (dishes, laundry)",
    "Make breakfast",
    "Take on car wash or house task",
    "Help them get ready before an appointment",
  ],
  "Physical Touch": [
    "Be mindful of hugs or hand-holding moments",
    "Give a back massage",
    "Unexpected kiss or touch",
    "Sit close, increase physical contact",
  ],
};

const DEFAULT_CHALLENGES = [
  "Give them 3 sincere compliments today",
  "Pick up their favorite snack on the way home",
  "Spend 30 minutes phone-free together",
  "Do a chore for them",
];

function getWeeklyChallenges(loveLanguage) {
  const list = LOVE_LANG_CHALLENGES[loveLanguage] || DEFAULT_CHALLENGES;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const seed = weekStart.getTime();
  const shuffled = [...list].sort(() => (Math.sin(seed) > 0 ? 1 : -1));
  return shuffled.slice(0, 5);
}

const ICONS = { "Words of Affirmation": "chatbubbles", "Quality Time": "time", "Receiving Gifts": "gift", "Acts of Service": "hand-left", "Physical Touch": "heart" };

export function LoveLanguageChallenges({ loveLanguage, partnerName = "Partner", onExpand }) {
  const challenges = getWeeklyChallenges(loveLanguage);
  const lang = loveLanguage || "Words of Affirmation";
  const icon = ICONS[lang] || "heart";

  return (
    <GlassCard style={s.card}>
      <View style={s.header}>
        <View style={[s.iconWrap, { backgroundColor: "rgba(236,72,153,0.2)" }]}>
          <Ionicons name={icon} size={20} color={colors.neonPink} />
        </View>
        <View style={s.headerText}>
          <Text style={s.title}>Love Language Challenges</Text>
          <Text style={s.subtitle}>For {partnerName} · {lang}</Text>
        </View>
      </View>
      <Text style={s.weekLabel}>This week's challenges</Text>
      {challenges.map((ch, i) => (
        <Pressable key={i} style={s.challengeRow} onPress={() => lightTap()}>
          <View style={s.checkWrap}>
            <View style={s.checkCircle} />
          </View>
          <Text style={s.challengeText}>{ch}</Text>
        </Pressable>
      ))}
    </GlassCard>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  headerText: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  weekLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 10 },
  challengeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  checkWrap: { marginRight: 12 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  challengeText: { flex: 1, color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
});
