import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

/* Concentric rings for budget - outer = goal, inner = progress */
const RING_COLORS = [colors.neonPurple, colors.gemElectricBlue, colors.neonCyan, colors.gemSunsetOrange];

export function RingBudgetChart({ spent = 1330, budget = 2000, saved = 450, currencySym = "₺" }) {
  const pct = Math.min(100, (spent / budget) * 100);
  const ringSize = 90;
  const stroke = 10;

  return (
    <View style={ringStyles.wrap}>
      <View style={[ringStyles.rings, { width: ringSize, height: ringSize }]}>
        <View style={[ringStyles.ringOuter, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderWidth: stroke }]} />
        <View style={[ringStyles.ringCenter, { width: ringSize - stroke * 2, height: ringSize - stroke * 2, borderRadius: (ringSize - stroke * 2) / 2 }]}>
          <Text style={ringStyles.percent}>{Math.round(pct)}%</Text>
          <Text style={ringStyles.label}>Spent</Text>
        </View>
      </View>
      <View style={ringStyles.legend}>
        <View style={ringStyles.legendRow}>
          <View style={[ringStyles.legendDot, { backgroundColor: colors.neonPurple }]} />
          <Text style={ringStyles.legendText}>{currencySym}{spent.toLocaleString()} spent</Text>
        </View>
        <View style={ringStyles.legendRow}>
          <View style={[ringStyles.legendDot, { backgroundColor: colors.gemElectricBlue }]} />
          <Text style={ringStyles.legendText}>{currencySym}{budget.toLocaleString()} budget</Text>
        </View>
        <View style={ringStyles.legendRow}>
          <View style={[ringStyles.legendDot, { backgroundColor: colors.gemEmeraldGreen }]} />
          <Text style={ringStyles.legendText}>{currencySym}{saved.toLocaleString()} saved</Text>
        </View>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  rings: { position: "relative", alignItems: "center", justifyContent: "center" },
  ringOuter: { position: "absolute", borderColor: "rgba(168,85,247,0.5)", backgroundColor: "transparent" },
  ringCenter: { position: "absolute", backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  percent: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  label: { color: colors.textSecondary, fontSize: 10 },
  legend: { flex: 1, marginLeft: 20 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendText: { color: colors.textSecondary, fontSize: 13 }, // spent, budget, saved
});
