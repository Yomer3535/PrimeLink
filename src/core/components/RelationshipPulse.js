import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

/* Wave-like bar heights based on activity intensity */
const PULSE_DATA = [40, 65, 55, 80, 70, 90, 60, 75, 85, 70, 95, 65];

export function RelationshipPulse({ label = "Relationship Pulse" }) {
  const max = Math.max(...PULSE_DATA);

  return (
    <View style={pulseStyles.wrap}>
      <Text style={pulseStyles.title}>{label}</Text>
      <Text style={pulseStyles.subtitle}>Intensity of shared memories and commitments</Text>
      <View style={pulseStyles.chart}>
        {PULSE_DATA.map((h, i) => (
          <View key={i} style={pulseStyles.barWrap}>
            <LinearGradient
              colors={[colors.neonPurple, colors.gemElectricBlue]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={[pulseStyles.bar, { height: `${(h / max) * 100}%` }]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const pulseStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginBottom: 12 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 60, gap: 4 },
  barWrap: { flex: 1, height: "100%", justifyContent: "flex-end" },
  bar: { borderRadius: 4, minHeight: 8 },
});
