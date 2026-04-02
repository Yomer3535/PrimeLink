import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "../utils/haptics";

const MOCK_CAPSULES = [
  { id: "1", date: "2025-12-31", label: "New Year message", locked: true },
  { id: "2", date: "2025-06-15", label: "Anniversary photo", locked: true },
  { id: "3", date: "2025-03-20", label: "Spring note", locked: false },
];

export function TimeCapsuleOrbs({ capsules = MOCK_CAPSULES }) {
  return (
    <View style={orbStyles.wrap}>
      <Text style={orbStyles.title}>Digital Time Capsule</Text>
      <Text style={orbStyles.subtitle}>Messages and photos to open on a specific date</Text>
      <View style={orbStyles.row}>
        {capsules.map((c, i) => (
          <Pressable key={c.id} onPress={() => lightTap()} style={orbStyles.orbWrap}>
            <View style={[orbStyles.orb, { backgroundColor: c.locked ? "rgba(168,85,247,0.2)" : "rgba(34,211,238,0.3)" }]}>
              <Ionicons
                name={c.locked ? "lock-closed" : "lock-open"}
                size={20}
                color={c.locked ? colors.neonPurple : colors.neonCyan}
              />
            </View>
            <Text style={orbStyles.orbLabel}>{c.label}</Text>
            <Text style={orbStyles.orbDate}>{c.date}</Text>
          </Pressable>
        ))}
        <Pressable style={orbStyles.addOrb} onPress={() => lightTap()}>
          <Ionicons name="add" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  orbWrap: { alignItems: "center" },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: colors.neonPurple,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  orbLabel: { color: colors.textPrimary, fontSize: 11, marginTop: 6, maxWidth: 70, textAlign: "center" },
  orbDate: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  addOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255,255,255,0.02)",
    justifyContent: "center",
    alignItems: "center",
  },
});
