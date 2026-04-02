import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "../utils/haptics";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysUntil(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

export function NextEventCard({ event, onPress, currencySym = "₺" }) {
  if (!event) return null;

  const d = event.date instanceof Date ? event.date : new Date(event.date);
  const days = daysUntil(event.date);
  const urg = days === 0 ? colors.gemSunsetOrange : days <= 3 ? colors.neonPurple : colors.gemElectricBlue;

  return (
    <Pressable onPress={() => { lightTap(); onPress?.(); }}>
      <GlassCard style={cardStyles.card}>
        <View style={cardStyles.header}>
          <View style={[cardStyles.iconWrap, { backgroundColor: "rgba(59,130,246,0.2)" }]}>
            <Ionicons name="calendar" size={20} color={colors.gemElectricBlue} />
          </View>
          <Text style={cardStyles.title}>Next event</Text>
        </View>
        <Text style={cardStyles.name}>{event.name}</Text>
        <Text style={cardStyles.eventTitle}>{event.title}</Text>
        <View style={cardStyles.footer}>
          <Text style={[cardStyles.urgency, { color: urg }]}>
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
          </Text>
          {event.amount > 0 && (
            <Text style={cardStyles.amount}>{currencySym}{event.amount}</Text>
          )}
        </View>
        <Text style={cardStyles.date}>
          {d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}
        </Text>
      </GlassCard>
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  card: { padding: 16, marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  title: { color: colors.textSecondary, fontSize: 12 },
  name: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  eventTitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  urgency: { fontSize: 14, fontWeight: "600" },
  amount: { color: colors.gemElectricBlue, fontSize: 14, fontWeight: "600" },
  date: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
});
