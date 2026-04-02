import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import { GlassCard } from "../../src/core/components/GlassCard";
import { NeonInput } from "../../src/core/components/NeonInput";
import { useAppState } from "../../src/core/state/AppStateProvider";
import { lightTap } from "../../src/core/utils/haptics";

const LOVE_LANGUAGE_OPTIONS = [
  "Words of Affirmation",
  "Quality Time",
  "Receiving Gifts",
  "Acts of Service",
  "Physical Touch",
];

const AVATAR_GRADIENTS = [
  ["#3B82F6", "#818CF8"],
  ["#A855F7", "#EC4899"],
  ["#F97316", "#FBBF24"],
  ["#10B981", "#22D3EE"],
  ["#6366F1", "#38BDF8"],
];

const PROFILE_SECTIONS = [
  {
    key: "loveLanguage",
    label: "Love Language",
    icon: "heart",
    type: "dropdown",
    options: LOVE_LANGUAGE_OPTIONS,
    hint: "Select",
  },
  {
    key: "criticalInfo",
    label: "Critical Info",
    icon: "warning",
    type: "combined",
    subKeys: ["allergies", "ringSize", "dislikes"],
    subLabels: { allergies: "Allergies", ringSize: "Ring size", dislikes: "Dislikes" },
    hint: "Allergies, ring size, things to avoid",
  },
  {
    key: "specialDays",
    label: "Special Days",
    icon: "calendar",
    type: "text",
    hint: "Meeting anniversary, first date, etc.",
  },
];

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || "?").substring(0, 2).toUpperCase();
}

function pickGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (name || "").charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getSectionValue(specs, section) {
  if (section.type === "combined") {
    const parts = section.subKeys
      .map((k) => specs[k] && `${section.subLabels[k]}: ${specs[k]}`)
      .filter(Boolean);
    return parts.join("\n");
  }
  return specs[section.key] || "";
}

function hasSectionData(specs, section) {
  const v = getSectionValue(specs, section);
  return v && v.trim().length > 0;
}

function ProfileCard({ section, value, onEdit }) {
  const isEmpty = !value || !value.trim();
  return (
    <GlassCard style={profileStyles.card}>
      <View style={profileStyles.cardHeader}>
        <View style={profileStyles.iconWrap}>
          <Ionicons name={section.icon} size={20} color={colors.gemElectricBlue} />
        </View>
        <Text style={profileStyles.cardLabel}>{section.label}</Text>
      </View>
      {isEmpty ? (
        <Pressable style={profileStyles.addBtn} onPress={onEdit}>
          <Ionicons name="add-circle-outline" size={18} color={colors.gemElectricBlue} />
          <Text style={profileStyles.addBtnText}>Add</Text>
        </Pressable>
      ) : (
        <Text style={profileStyles.cardValue} numberOfLines={4}>
          {value}
        </Text>
      )}
    </GlassCard>
  );
}

export default function ProfilePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { contacts, contactSpecs, updateContactSpecs, addCustomField } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const contact = contacts.find((c) => c.id === id) || contacts[0];
  const specs = contactSpecs[id] || {};
  const customFields = specs.customFields || {};
  const initials = getInitials(contact.fullName);
  const gradient = pickGradient(contact.fullName);

  function openEdit(section) {
    setEditingSection(section);
    setEditOpen(true);
  }

  function handleAddCustomField() {
    const key = newFieldKey.trim();
    if (!key) return;
    addCustomField(id, key, newFieldValue.trim());
    setNewFieldKey("");
    setNewFieldValue("");
    lightTap();
  }

  const visibleSections = PROFILE_SECTIONS.filter(
    (s) => hasSectionData(specs, s) || s.key === "loveLanguage" || s.key === "criticalInfo" || s.key === "specialDays"
  );

  return (
    <KeyboardAvoidingView style={profileStyles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={profileStyles.container}
        contentContainerStyle={profileStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={profileStyles.topBar}>
          <Pressable onPress={() => { lightTap(); router.back(); }} style={profileStyles.backButton}>
            <Text style={profileStyles.backChevron}>‹</Text>
            <Text style={profileStyles.backLabel}>Back</Text>
          </Pressable>
          <Pressable onPress={() => { lightTap(); setEditOpen(true); setEditingSection(null); }} style={profileStyles.editBtn}>
            <Text style={profileStyles.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        <View style={profileStyles.header}>
          <View style={profileStyles.avatarGlow}>
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>
          <Text style={profileStyles.name}>{contact.fullName}</Text>
          <Text style={profileStyles.relationshipType}>
            {contact.relationshipType.charAt(0).toUpperCase() + contact.relationshipType.slice(1)}
          </Text>
        </View>

        <View style={profileStyles.cards}>
          {PROFILE_SECTIONS.map((section) => (
            <ProfileCard
              key={section.key}
              section={section}
              value={getSectionValue(specs, section)}
              onEdit={() => openEdit(section)}
            />
          ))}

          {Object.keys(customFields).length > 0 && (
            <GlassCard style={profileStyles.section}>
              <Text style={profileStyles.sectionTitle}>Custom Fields</Text>
              {Object.entries(customFields).map(([key, val]) => (
                <View key={key} style={profileStyles.customRow}>
                  <Text style={profileStyles.customKey}>{key}</Text>
                  <Text style={profileStyles.customVal}>{val || "—"}</Text>
                </View>
              ))}
            </GlassCard>
          )}

          <GlassCard style={profileStyles.section}>
            <Text style={profileStyles.sectionTitle}>Gift history</Text>
            <Text style={profileStyles.historyLine}>2024 Birthday · XYZ bag — 12,000₺</Text>
            <Text style={profileStyles.historyLine}>2023 Anniversary · Weekend trip — 8,500₺</Text>
            <Text style={profileStyles.historyDim}>Gifts you add from Timeline will appear here.</Text>
          </GlassCard>
        </View>
      </ScrollView>

      {editOpen && (
        <View style={profileStyles.editOverlay}>
          <Pressable style={profileStyles.editBackdrop} onPress={() => { setEditOpen(false); setEditingSection(null); }} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={profileStyles.editKAV}>
            <ScrollView style={profileStyles.editSheet} contentContainerStyle={profileStyles.editScroll} keyboardShouldPersistTaps="handled">
              <Text style={profileStyles.editTitle}>
                {editingSection ? editingSection.label : "Edit info"}
              </Text>

              {!editingSection ? (
                <>
                  {PROFILE_SECTIONS.map((s) => (
                    <Pressable key={s.key} style={profileStyles.editSectionBtn} onPress={() => setEditingSection(s)}>
                      <Ionicons name={s.icon} size={20} color={colors.gemElectricBlue} />
                      <Text style={profileStyles.editSectionBtnText}>{s.label}</Text>
                      <Text style={profileStyles.editSectionBtnHint}>
                        {hasSectionData(specs, s) ? "Edit" : "Add"}
                      </Text>
                    </Pressable>
                  ))}

                  <Text style={profileStyles.editSection}>Add New Field</Text>
                  <View style={profileStyles.editField}>
                    <Text style={profileStyles.editLabel}>Title</Text>
                    <NeonInput value={newFieldKey} onChangeText={setNewFieldKey} placeholder="e.g. Favorite wines" textCapitalization="words" returnKeyType="next" />
                  </View>
                  <View style={profileStyles.editField}>
                    <Text style={profileStyles.editLabel}>Content</Text>
                    <NeonInput value={newFieldValue} onChangeText={setNewFieldValue} placeholder="Value" returnKeyType="done" />
                  </View>
                  <Pressable style={profileStyles.addFieldBtn} onPress={handleAddCustomField}>
                    <Ionicons name="add" size={18} color={colors.textPrimary} />
                    <Text style={profileStyles.addFieldText}>Add Field</Text>
                  </Pressable>
                </>
              ) : editingSection.type === "dropdown" ? (
                <View style={profileStyles.dropdownWrap}>
                  {editingSection.options.map((opt) => (
                    <Pressable
                      key={opt}
                      style={[profileStyles.dropdownOption, specs[editingSection.key] === opt && profileStyles.dropdownOptionActive]}
                      onPress={() => { lightTap(); updateContactSpecs(id, { [editingSection.key]: opt }); }}
                    >
                      <Text style={[profileStyles.dropdownText, specs[editingSection.key] === opt && profileStyles.dropdownTextActive]}>{opt}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={profileStyles.backToSections} onPress={() => setEditingSection(null)}>
                    <Text style={profileStyles.backToSectionsText}>← Back to sections</Text>
                  </Pressable>
                </View>
              ) : editingSection.type === "combined" ? (
                <>
                  {editingSection.subKeys.map((k) => (
                    <View key={k} style={profileStyles.editField}>
                      <Text style={profileStyles.editLabel}>{editingSection.subLabels[k]}</Text>
                      <NeonInput
                        value={specs[k] || ""}
                        onChangeText={(t) => updateContactSpecs(id, { [k]: t })}
                        placeholder={editingSection.subLabels[k]}
                        returnKeyType="next"
                      />
                    </View>
                  ))}
                  <Pressable style={profileStyles.backToSections} onPress={() => setEditingSection(null)}>
                    <Text style={profileStyles.backToSectionsText}>← Back to sections</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={profileStyles.editField}>
                    <NeonInput
                      value={specs[editingSection.key] || ""}
                      onChangeText={(t) => updateContactSpecs(id, { [editingSection.key]: t })}
                      placeholder={editingSection.hint}
                      multiline
                      returnKeyType="done"
                    />
                  </View>
                  <Pressable style={profileStyles.backToSections} onPress={() => setEditingSection(null)}>
                    <Text style={profileStyles.backToSectionsText}>← Back to sections</Text>
                  </Pressable>
                </>
              )}

              <Pressable style={profileStyles.editDone} onPress={() => { lightTap(); setEditOpen(false); setEditingSection(null); Keyboard.dismiss(); }}>
                <Text style={profileStyles.editDoneText}>Done</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const profileStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 52 },
  scrollContent: { paddingBottom: 60 },
  topBar: { height: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  editBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  editBtnText: { color: colors.gemElectricBlue, fontSize: 14, fontWeight: "600" },
  backChevron: { color: colors.textSecondary, fontSize: 24 },
  backLabel: { color: colors.textSecondary, fontSize: 14 },
  header: { alignItems: "center", marginBottom: 28 },
  avatarGlow: { shadowColor: colors.gemElectricBlue, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center" },
  avatarText: { color: colors.textPrimary, fontSize: 30, fontWeight: "700", letterSpacing: 1 },
  name: { color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginTop: 20 },
  relationshipType: { color: colors.textSecondary, marginTop: 6, fontSize: 15 },
  cards: { gap: 14 },
  card: { padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.15)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  cardValue: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  addBtnText: { color: colors.gemElectricBlue, fontSize: 14, fontWeight: "600" },
  section: { paddingVertical: 16, paddingHorizontal: 18 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 12 },
  customRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  customKey: { color: colors.textSecondary, fontSize: 12 },
  customVal: { color: colors.textPrimary, fontSize: 14, marginTop: 4 },
  historyLine: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
  historyDim: { color: colors.textSecondary, fontSize: 12, marginTop: 12, opacity: 0.6 },
  editOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  editBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  editKAV: { maxHeight: "88%" },
  editSheet: { backgroundColor: "#0A0C14", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  editScroll: { padding: 24, paddingBottom: 48 },
  editTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 20 },
  editSectionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", marginBottom: 10 },
  editSectionBtnText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600", flex: 1 },
  editSectionBtnHint: { color: colors.textSecondary, fontSize: 13 },
  editSection: { color: colors.gemElectricBlue, fontSize: 14, fontWeight: "600", marginTop: 20, marginBottom: 12 },
  editField: { marginBottom: 14 },
  editLabel: { color: colors.textPrimary, fontSize: 13, marginBottom: 6 },
  dropdownWrap: { gap: 8 },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  dropdownOptionActive: { backgroundColor: "rgba(59,130,246,0.2)", borderWidth: 1, borderColor: colors.gemElectricBlue },
  dropdownText: { color: colors.textSecondary, fontSize: 15 },
  dropdownTextActive: { color: colors.textPrimary, fontWeight: "600" },
  backToSections: { marginTop: 16 },
  backToSectionsText: { color: colors.gemElectricBlue, fontSize: 14 },
  addFieldBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(59,130,246,0.4)", borderStyle: "dashed", marginTop: 8 },
  addFieldText: { color: colors.gemElectricBlue, fontWeight: "600", fontSize: 14 },
  editDone: { marginTop: 20, paddingVertical: 14, backgroundColor: colors.gemElectricBlue, borderRadius: 14, alignItems: "center" },
  editDoneText: { color: colors.textPrimary, fontWeight: "600", fontSize: 15 },
});
