import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";
import { GlassCard } from "../../core/components/GlassCard";
import { PrimaryButton } from "../../core/components/PrimaryButton";
import { NeonInput } from "../../core/components/NeonInput";
import { useAppState } from "../../core/state/AppStateProvider";
import { lightTap } from "../../core/utils/haptics";

export default function ProfilesScreen() {
  const router = useRouter();
  const { contacts, addContact, isPremium } = useAppState();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [relationshipType, setRelationshipType] = useState("other");
  const [limitMessage, setLimitMessage] = useState("");

  function handleAddPress() {
    setLimitMessage("");
    // If not premium and already at limit, go straight to paywall
    if (!isPremium && contacts.length >= 3) {
      router.push("/paywall");
      return;
    }
    setSheetOpen(true);
  }

  function handleSubmit() {
    if (!fullName.trim()) return;
    const result = addContact({ fullName: fullName.trim(), relationshipType });
    if (!result.ok && result.reason === "limit") {
      // Close the sheet and navigate to the premium paywall
      setSheetOpen(false);
      setFullName("");
      setRelationshipType("other");
      router.push("/paywall");
      return;
    }
    setFullName("");
    setRelationshipType("other");
    setSheetOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relationship profiles</Text>
      <Text style={styles.subtitle}>
        Save sizes, preferences, and every gift you have given.
      </Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => { lightTap(); router.push(`/profile/${item.id}`); }}>
            <GlassCard style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.type}>{item.relationshipType}</Text>
              </View>
              <Text style={styles.chevron}>{"\u203A"}</Text>
            </GlassCard>
          </Pressable>
        )}
      />

      {limitMessage.length > 0 && !isPremium && (
        <Text style={styles.limitText}>{limitMessage}</Text>
      )}

      <PrimaryButton
        label="Add person to track"
        onPress={handleAddPress}
        style={styles.cta}
      />

      {sheetOpen && (
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSheetOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.sheetKAV}
          >
            <ScrollView
              style={styles.sheet}
              contentContainerStyle={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <Text style={styles.sheetTitle}>New connection</Text>
              <Text style={styles.sheetSubtitle}>
                Add someone you want to stay deeply connected to.
              </Text>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Name</Text>
                <NeonInput
                  placeholder="e.g. Sarah Collins"
                  value={fullName}
                  onChangeText={setFullName}
                  textCapitalization="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Relationship type</Text>
                <NeonInput
                  placeholder="Partner, family, friend..."
                  value={relationshipType}
                  onChangeText={setRelationshipType}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.sheetButtons}>
                <PrimaryButton
                  label="Cancel"
                  onPress={() => setSheetOpen(false)}
                  style={[styles.sheetButton, { backgroundColor: colors.surface }]}
                />
                <PrimaryButton
                  label="Save"
                  onPress={handleSubmit}
                  style={styles.sheetButton}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 96,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  type: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 22,
    opacity: 0.4,
    marginLeft: 8,
  },
  cta: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 32,
  },
  limitText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 56,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetKAV: {
    maxHeight: "80%",
  },
  sheet: {
    backgroundColor: "#0A0C14",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  sheetField: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 4,
  },
  sheetButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  sheetButton: {
    flex: 1,
  },
});

