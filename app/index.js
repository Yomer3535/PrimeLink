import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { selectionChange } from "../src/core/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { HomeScreen } from "../src/features/relationshipDashboard/HomeScreen";
import ProfilesScreen from "../src/features/profiles/ProfilesScreen";
import FinancialVaultPage from "./vault";
import IdeaLabPage from "./ideas";
import { colors } from "../src/theme/colors";
import { useAppState } from "../src/core/state/AppStateProvider";

const TABS_BASE = ["timeline", "profiles", "ideas"];
const SCREEN_WIDTH = Dimensions.get("window").width;

/* ── Minimal outline-style tab icons ── */
function TabIcon({ tab, active }) {
  const c = active ? colors.textPrimary : colors.textSecondary;
  const size = 22;
  const stroke = 1.5;

  if (tab === "timeline") {
    // Clock outline
    return (
      <View style={[ic.wrap, { width: size, height: size }]}>
        <View style={[ic.circle, { borderColor: c, borderWidth: stroke }]} />
        <View style={[ic.clockHand, { backgroundColor: c, height: 6, top: 4, left: size / 2 - 0.5 }]} />
        <View style={[ic.clockHand, { backgroundColor: c, width: 5, height: 1, top: size / 2 - 0.5, left: size / 2 - 0.5 }]} />
      </View>
    );
  }
  if (tab === "profiles") {
    // Person outline
    return (
      <View style={[ic.wrap, { width: size, height: size }]}>
        <View style={[ic.personHead, { borderColor: c, borderWidth: stroke }]} />
        <View style={[ic.personBody, { borderColor: c, borderWidth: stroke }]} />
      </View>
    );
  }
  if (tab === "vault") {
    // Diamond outline
    return (
      <View style={[ic.wrap, { width: size, height: size }]}>
        <View style={[ic.diamond, { borderColor: c, borderWidth: stroke }]} />
      </View>
    );
  }
  // Ideas — lightbulb
  return (
    <View style={[ic.wrap, { width: size, height: size }]}>
      <View style={[ic.bulbTop, { borderColor: c, borderWidth: stroke }]} />
      <View style={[ic.bulbBase, { borderColor: c, borderWidth: stroke }]} />
    </View>
  );
}

const ic = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  circle: { width: 18, height: 18, borderRadius: 9 },
  clockHand: { position: "absolute", width: 1, borderRadius: 1 },
  personHead: { width: 8, height: 8, borderRadius: 4, position: "absolute", top: 0 },
  personBody: { width: 14, height: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, position: "absolute", bottom: 0, borderBottomWidth: 0 },
  diamond: { width: 12, height: 12, borderRadius: 2, transform: [{ rotate: "45deg" }] },
  bulbTop: { width: 12, height: 12, borderRadius: 6, position: "absolute", top: 0 },
  bulbBase: { width: 8, height: 4, borderRadius: 1, position: "absolute", bottom: 2, borderTopWidth: 0 },
});

export default function Page() {
  const { isPremium } = useAppState();
  const [activeTab, setActiveTab] = useState("timeline");
  const scrollRef = useRef(null);
  const router = useRouter();

  const TABS = isPremium ? ["timeline", "profiles", "ideas", "vault"] : TABS_BASE;
  const tabIndex = TABS.indexOf(activeTab);

  function handleTabPress(tab) {
    selectionChange();
    const index = TABS.indexOf(tab);
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  }

  function handleMomentumEnd(event) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    const tab = TABS[index] || "timeline";
    if (tab !== activeTab) setActiveTab(tab);
  }

  return (
    <View style={styles.root}>
      {/* Settings gear — glass style */}
      <Pressable style={styles.settingsButton} onPress={() => { selectionChange(); router.push("/settings"); }}>
        <View style={styles.settingsRing}>
          <View style={styles.settingsDot} />
        </View>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        contentOffset={{ x: tabIndex * SCREEN_WIDTH, y: 0 }}
      >
        <View style={styles.page}><HomeScreen /></View>
        <View style={styles.page}><ProfilesScreen /></View>
        <View style={styles.page}><IdeaLabPage /></View>
        {isPremium && <View style={styles.page}><FinancialVaultPage /></View>}
      </ScrollView>

      {/* Tab bar — no top border line, deep dark bg */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable key={tab} onPress={() => handleTabPress(tab)} style={styles.tab}>
              <TabIcon tab={tab} active={isActive} />
              <Text style={[styles.tabLabel, { color: isActive ? colors.textPrimary : colors.textSecondary }]}>
                {tab === "timeline" ? "Timeline" : tab === "profiles" ? "Profiles" : tab === "vault" ? "Vault" : "Ideas"}
              </Text>
              {/* Neon glow dot under active tab */}
              {isActive && (
                <View style={styles.glowDotWrap}>
                  <View style={styles.glowDot} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingsButton: {
    position: "absolute",
    right: 16,
    top: 32,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(8,10,18,0.8)",
  },
  settingsRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#030306",
    paddingBottom: 20,
    paddingTop: 10,
    justifyContent: "space-around",
    borderTopWidth: 0,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  glowDotWrap: {
    marginTop: 4,
  },
  glowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gemElectricBlue,
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
});
