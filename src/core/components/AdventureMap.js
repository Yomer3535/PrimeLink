import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "../utils/haptics";
import { useState } from "react";

const MOCK_ROUTES = [
  { id: "1", name: "Istiklal Street", city: "Istanbul", visited: true },
  { id: "2", name: "Galata Tower area", city: "Istanbul", visited: false },
  { id: "3", name: "Cappadocia balloon tour", city: "Turkey", visited: false },
  { id: "4", name: "Ephesus ancient city", city: "Izmir", visited: true },
  { id: "5", name: "Kemeraltı Bazaar", city: "Izmir", visited: false },
  { id: "6", name: "Pamukkale travertines", city: "Turkey", visited: false },
  { id: "7", name: "Bosphorus tour", city: "Istanbul", visited: false },
  { id: "8", name: "Santorini sunset", city: "Greece", visited: false },
];

export function AdventureMap({ routes = MOCK_ROUTES }) {
  const [visited, setVisited] = useState(new Set(routes.filter((r) => r.visited).map((r) => r.id)));

  function toggleVisited(id) {
    lightTap();
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <GlassCard style={s.card}>
      <View style={s.header}>
        <View style={[s.iconWrap, { backgroundColor: "rgba(34,211,238,0.2)" }]}>
          <Ionicons name="map" size={22} color={colors.neonCyan} />
        </View>
        <View style={s.headerText}>
          <Text style={s.title}>Adventure Map</Text>
          <Text style={s.subtitle}>Scratch off places you've visited</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {routes.map((r) => {
          const isVisited = visited.has(r.id);
          return (
            <Pressable key={r.id} onPress={() => toggleVisited(r.id)} style={s.routeCard}>
              {isVisited ? (
                <LinearGradient
                  colors={[colors.neonCyan, colors.neonPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.routeGrad}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" style={{ marginBottom: 8 }} />
                  <Text style={s.routeNameVisited}>{r.name}</Text>
                  <Text style={s.routeCity}>{r.city}</Text>
                </LinearGradient>
              ) : (
                <View style={s.routeScratched}>
                  <Ionicons name="ellipse-outline" size={24} color={colors.textSecondary} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <Text style={s.routeName}>{r.name}</Text>
                  <Text style={s.routeCityDim}>{r.city}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </GlassCard>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  headerText: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  scroll: { paddingRight: 20, gap: 12 },
  routeCard: { width: 140, height: 100, borderRadius: 16, overflow: "hidden" },
  routeGrad: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center" },
  routeScratched: { flex: 1, padding: 12, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16 },
  routeName: { color: colors.textSecondary, fontSize: 12, fontWeight: "600", textAlign: "center", opacity: 0.7 },
  routeNameVisited: { color: "#fff", fontSize: 12, fontWeight: "700", textAlign: "center" },
  routeCity: { color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 4 },
  routeCityDim: { color: colors.textSecondary, fontSize: 10, marginTop: 4, opacity: 0.5 },
});
