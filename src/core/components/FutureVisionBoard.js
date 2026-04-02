import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "../utils/haptics";

const MOCK_DREAMS = [
  { id: "1", label: "House", emoji: "🏠", image: null },
  { id: "2", label: "Car", emoji: "🚗", image: null },
  { id: "3", label: "Pet", emoji: "🐕", image: null },
  { id: "4", label: "Vacation home", emoji: "🏖️", image: null },
  { id: "5", label: "Wedding", emoji: "💒", image: null },
];

function DreamCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={visionStyles.card}>
      <View style={visionStyles.cardInner}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={visionStyles.img} resizeMode="cover" />
        ) : (
          <View style={visionStyles.placeholder}>
            <Text style={visionStyles.emoji}>{item.emoji}</Text>
            <Text style={visionStyles.label}>{item.label}</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={visionStyles.overlay}
        />
      </View>
    </Pressable>
  );
}

const visionStyles = StyleSheet.create({
  wrap: { padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  headerText: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  scroll: { paddingRight: 20, flexDirection: "row", alignItems: "center" },
  card: { width: 100, height: 100, borderRadius: 16, overflow: "hidden", marginRight: 12 },
  cardInner: { flex: 1, position: "relative" },
  img: { width: "100%", height: "100%" },
  placeholder: { flex: 1, backgroundColor: "rgba(168,85,247,0.2)", justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 28, marginBottom: 4 },
  label: { color: colors.textPrimary, fontSize: 11, fontWeight: "600" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 40 },
  addCard: { width: 100, height: 100, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed", backgroundColor: "rgba(255,255,255,0.02)", justifyContent: "center", alignItems: "center" },
  addText: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
});

export function FutureVisionBoard({ dreams = MOCK_DREAMS }) {
  return (
    <GlassCard style={visionStyles.wrap}>
      <View style={visionStyles.header}>
        <View style={[visionStyles.iconWrap, { backgroundColor: "rgba(249,115,22,0.2)" }]}>
          <Ionicons name="sparkles" size={20} color={colors.gemSunsetOrange} />
        </View>
        <View style={visionStyles.headerText}>
          <Text style={visionStyles.title}>Future Vision Board</Text>
          <Text style={visionStyles.subtitle}>Things you want to have together</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={visionStyles.scroll}>
        {dreams.map((d) => (
          <DreamCard key={d.id} item={d} onPress={() => lightTap()} />
        ))}
        <Pressable style={visionStyles.addCard} onPress={() => lightTap()}>
          <Ionicons name="add" size={28} color={colors.textSecondary} />
          <Text style={visionStyles.addText}>Add</Text>
        </Pressable>
      </ScrollView>
    </GlassCard>
  );
}
