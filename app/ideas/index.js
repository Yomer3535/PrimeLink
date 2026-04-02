import { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Linking,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme/colors";
import { GlassCard } from "../../src/core/components/GlassCard";
import { PrimaryButton } from "../../src/core/components/PrimaryButton";
import { NeonInput } from "../../src/core/components/NeonInput";
import { loadIdeas, saveIdeas } from "../../src/core/storage/persistence";
import { useAppState } from "../../src/core/state/AppStateProvider";
import { lightTap } from "../../src/core/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { DateNightRouletteModal } from "../../src/core/components/DateNightRouletteModal";
import { LoveLanguageChallenges } from "../../src/core/components/LoveLanguageChallenges";
import { AdventureMap } from "../../src/core/components/AdventureMap";
import { FutureVisionBoard } from "../../src/core/components/FutureVisionBoard";

const MOCK_IDEAS = [
  { id: "1", title: "Perfume – niche brand", contactName: "Sarah", note: "Warm vanilla notes. Le Labo or Byredo style.", imageUri: "https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=400", link: "https://lelabofragrances.com" },
  { id: "2", title: "Coffee tasting night", contactName: "Daniel", note: "3 roasters, dessert.", imageUri: "https://images.pexels.com/photos/373888/pexels-photo-373888.jpeg?auto=compress&cs=tinysrgb&w=400", link: "" },
  { id: "3", title: "Flower subscription", contactName: "Mom", note: "Seasonal bouquet, soft colors.", imageUri: "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=400", link: "https://bloomon.com" },
];

const PLACEHOLDER_SUGGESTIONS = [
  { id: "p1", title: "Experience gift", hint: "Think of an activity you can do together", forContact: "Someone", imageUri: null, note: "", link: "" },
  { id: "p2", title: "Personalized gift", hint: "Check your loved one's wishlist", forContact: "Someone", imageUri: null, note: "", link: "" },
  { id: "p3", title: "Meaningful moment", hint: "Plan a small but impactful surprise", forContact: "Someone", imageUri: null, note: "", link: "" },
];

const AVATAR_GRADIENTS = [
  ["#3B82F6", "#818CF8"],
  ["#A855F7", "#EC4899"],
  ["#F97316", "#FBBF24"],
  ["#10B981", "#22D3EE"],
];

function getInitials(name) {
  return (name || "?").substring(0, 1).toUpperCase();
}

function pickGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (name || "").charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function buildSuggestions(ideas, contactSpecs, contacts) {
  const cards = [];
  ideas.forEach((idea) => {
    cards.push({
      id: idea.id,
      title: idea.title,
      note: idea.note || "",
      link: idea.link || "",
      hint: `For ${idea.contactName}`,
      forContact: idea.contactName,
      imageUri: idea.imageUri,
      type: "idea",
    });
  });
  Object.entries(contactSpecs || {}).forEach(([contactId, spec]) => {
    const contact = contacts?.find((c) => c.id === contactId);
    const name = contact?.fullName?.split(" ")[0] || "Someone";
    if (spec.wishlist) {
      spec.wishlist.split(/[,;]/).forEach((item, i) => {
        const t = item.trim();
        if (t && t.length > 2) {
          cards.push({
            id: `wish-${contactId}-${i}`,
            title: t,
            note: "",
            link: "",
            hint: `For ${name}`,
            forContact: name,
            imageUri: null,
            type: "wishlist",
          });
        }
      });
    }
  });
  return cards.length > 0 ? cards : PLACEHOLDER_SUGGESTIONS;
}

const CARD_GAP = 12;
const NUM_COLUMNS = 2;

function MoodCard({ card, onPress }) {
  const gradient = pickGradient(card.forContact);
  const hasImage = !!card.imageUri;
  const noteLen = (card.note || "").length;
  const height = hasImage ? (noteLen > 40 ? 200 : 160) : 110;

  return (
    <Pressable onPress={onPress}>
      <GlassCard style={[moodStyles.card, { minHeight: height }]}>
      <View style={moodStyles.cardInner}>
        {hasImage ? (
          <View style={moodStyles.imageWrap}>
            <Image source={{ uri: card.imageUri }} style={moodStyles.image} resizeMode="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={moodStyles.imageOverlay}
            />
          </View>
        ) : (
          <View style={[moodStyles.imagePlaceholder, { backgroundColor: gradient[0] + "30" }]} />
        )}
        <View style={moodStyles.cardContent}>
          <Text style={moodStyles.cardTitle} numberOfLines={2}>{card.title}</Text>
          <Text style={moodStyles.cardHint}>{card.hint}</Text>
        </View>
        <View style={[moodStyles.avatarBadge, { backgroundColor: gradient[0] }]}>
          <Text style={moodStyles.avatarText}>{getInitials(card.forContact)}</Text>
        </View>
      </View>
    </GlassCard>
    </Pressable>
  );
}

const moodStyles = StyleSheet.create({
  card: { overflow: "hidden", padding: 0 },
  cardInner: { flex: 1, position: "relative" },
  imageWrap: { height: 100, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 50 },
  imagePlaceholder: { height: 80 },
  cardContent: { padding: 12 },
  cardTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  cardHint: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  avatarBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});

function IdeaDetailView({ card, onClose }) {
  const gradient = pickGradient(card?.forContact);

  if (!card) return null;

  const openLink = () => {
    if (card.link && card.link.startsWith("http")) {
      lightTap();
      Linking.openURL(card.link);
    }
  };

  return (
    <Modal visible={!!card} transparent animationType="fade">
      <Pressable style={detailStyles.overlay} onPress={onClose}>
        <Pressable style={detailStyles.content} onPress={(e) => e.stopPropagation()}>
          <GlassCard style={detailStyles.card}>
            <View style={detailStyles.header}>
              <View style={[detailStyles.avatar, { backgroundColor: gradient[0] }]}>
                <Text style={detailStyles.avatarText}>{getInitials(card.forContact)}</Text>
              </View>
              <Text style={detailStyles.hint}>{card.hint}</Text>
              <Pressable style={detailStyles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {card.imageUri ? (
              <View style={detailStyles.imageWrap}>
                <Image source={{ uri: card.imageUri }} style={detailStyles.image} resizeMode="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={detailStyles.imageGradient} />
              </View>
            ) : null}

            <Text style={detailStyles.title}>{card.title}</Text>
            {card.note ? (
              <Text style={detailStyles.note}>{card.note}</Text>
            ) : null}
            {card.link ? (
              <Pressable style={detailStyles.linkBtn} onPress={openLink}>
                <Ionicons name="link" size={18} color={colors.gemElectricBlue} />
                <Text style={detailStyles.linkText}>Open link</Text>
              </Pressable>
            ) : null}
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: { width: "100%", maxWidth: 400 },
  card: { padding: 0, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  hint: { flex: 1, color: colors.textSecondary, fontSize: 13 },
  closeBtn: { padding: 4 },
  imageWrap: { height: 180, position: "relative" },
  image: { width: "100%", height: "100%" },
  imageGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: "700", paddingHorizontal: 16, paddingTop: 12 },
  note: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  linkText: { color: colors.gemElectricBlue, fontSize: 14, fontWeight: "600" },
});

export default function IdeaLabPage() {
  const { contacts, contactSpecs } = useAppState();
  const [ideas, setIdeas] = useState(MOCK_IDEAS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ideasLoaded, setIdeasLoaded] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    loadIdeas().then((stored) => {
      if (Array.isArray(stored) && stored.length > 0) setIdeas(stored);
      setIdeasLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!ideasLoaded) return;
    saveIdeas(ideas);
  }, [ideas, ideasLoaded]);

  const suggestions = useMemo(
    () => buildSuggestions(ideas, contactSpecs, contacts),
    [ideas, contactSpecs, contacts]
  );

  const { width } = Dimensions.get("window");
  const cardWidth = (width - 40 - CARD_GAP) / NUM_COLUMNS;

  const leftCol = suggestions.filter((_, i) => i % 2 === 0);
  const rightCol = suggestions.filter((_, i) => i % 2 === 1);

  function handleAddIdea() {
    if (!title.trim()) return;
    lightTap();
    setIdeas((prev) => [
      {
        id: Date.now().toString(),
        title: title.trim(),
        contactName: contactName.trim() || "Someone special",
        note: note.trim() || "",
        link: link.trim() || "",
        imageUri: "https://images.pexels.com/photos/794494/pexels-photo-794494.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      ...prev,
    ]);
    setTitle("");
    setContactName("");
    setNote("");
    setLink("");
    setSheetOpen(false);
    Keyboard.dismiss();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Idea Board</Text>
      <Text style={styles.subtitle}>
        Discover · Suggestions based on your notes
      </Text>

      <Pressable
        onPress={() => { lightTap(); setRouletteOpen(true); }}
        style={styles.rouletteCard}
      >
        <GlassCard style={styles.rouletteInner}>
          <View style={styles.rouletteIconWrap}>
            <Ionicons name="help-circle" size={32} color={colors.neonPurple} />
          </View>
          <View style={styles.rouletteText}>
<Text style={styles.rouletteTitle}>Date Night Roulette</Text>
          <Text style={styles.rouletteHint}>Spin the wheel when you don't know what to do</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </GlassCard>
      </Pressable>

      <LoveLanguageChallenges
        loveLanguage={contacts?.[0] ? (contactSpecs[contacts[0].id]?.loveLanguage || "Words of Affirmation") : "Words of Affirmation"}
        partnerName={contacts?.[0]?.fullName?.split(" ")[0] || "Partner"}
      />

      <AdventureMap />
      <FutureVisionBoard />

      <View style={styles.masonry}>
        <View style={styles.column}>
          {leftCol.map((card) => (
            <View key={card.id} style={[styles.masonryItem, { width: cardWidth }]}>
              <MoodCard card={card} onPress={() => { lightTap(); setSelectedCard(card); }} />
            </View>
          ))}
        </View>
        <View style={styles.column}>
          {rightCol.map((card) => (
            <View key={card.id} style={[styles.masonryItem, { width: cardWidth }]}>
              <MoodCard card={card} onPress={() => { lightTap(); setSelectedCard(card); }} />
            </View>
          ))}
        </View>
      </View>

      <PrimaryButton
        label="+ Add idea"
        onPress={() => setSheetOpen(true)}
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
              <Text style={styles.sheetTitle}>Add idea</Text>
              <Text style={styles.sheetSubtitle}>
                Gift, experience, or inspiration note.
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>What?</Text>
                <NeonInput placeholder="e.g. Vintage watch" value={title} onChangeText={setTitle} returnKeyType="next" />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>For whom?</Text>
                <NeonInput placeholder="Name" value={contactName} onChangeText={setContactName} textCapitalization="words" returnKeyType="next" />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Note (optional)</Text>
                <NeonInput placeholder="Why, where you saw it..." value={note} onChangeText={setNote} returnKeyType="next" />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Link (optional)</Text>
                <NeonInput placeholder="https://..." value={link} onChangeText={setLink} keyboardType="url" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} />
              </View>

              <View style={styles.sheetButtons}>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnCancel]} onPress={() => setSheetOpen(false)}>
                  <Text style={styles.sheetBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnSave]} onPress={handleAddIdea}>
                  <Text style={[styles.sheetBtnText, { color: colors.textPrimary }]}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      <IdeaDetailView card={selectedCard} onClose={() => setSelectedCard(null)} />
      <DateNightRouletteModal visible={rouletteOpen} onClose={() => setRouletteOpen(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 16 },
  rouletteCard: { marginBottom: 20 },
  rouletteInner: { flexDirection: "row", alignItems: "center", padding: 16 },
  rouletteIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(168,85,247,0.2)", justifyContent: "center", alignItems: "center", marginRight: 14 },
  rouletteText: { flex: 1 },
  rouletteTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  rouletteHint: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  masonry: { flexDirection: "row", gap: CARD_GAP },
  column: { flex: 1, gap: CARD_GAP },
  masonryItem: { marginBottom: CARD_GAP },
  cta: { marginTop: 24 },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheetKAV: { maxHeight: "75%" },
  sheet: {
    backgroundColor: "#0A0C14",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sheetScroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  sheetTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: "700", marginBottom: 4 },
  sheetSubtitle: { color: colors.textSecondary, fontSize: 14, marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { color: colors.textPrimary, fontSize: 13, marginBottom: 6 },
  sheetButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  sheetBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  sheetBtnCancel: { backgroundColor: colors.surface },
  sheetBtnSave: { backgroundColor: colors.gemElectricBlue },
  sheetBtnText: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
});
