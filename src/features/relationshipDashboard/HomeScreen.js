import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";
import { Gem } from "../../core/components/Gem";
import { GlassCard } from "../../core/components/GlassCard";
import { NeonInput } from "../../core/components/NeonInput";
import { useAppState } from "../../core/state/AppStateProvider";
import { lightTap } from "../../core/utils/haptics";
import { loadEvents, saveEvents } from "../../core/storage/persistence";
import { GlassDatePickerModal } from "../../core/components/GlassDatePickerModal";

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", TRY: "₺" };
const TODAY = new Date();
const CARD_WIDTH = 56;
const CARD_GAP = 10;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildCalendarDays(offset, count) {
  const days = [];
  const base = new Date(TODAY);
  base.setHours(0, 0, 0, 0);
  for (let i = offset; i < offset + count; i++) {
    days.push(new Date(base.getTime() + i * 24 * 60 * 60 * 1000));
  }
  return days;
}

function daysUntil(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const t = new Date(TODAY);
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

function getEventsForDate(events, date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return events.filter((e) => {
    const ed = new Date(e.date);
    ed.setHours(0, 0, 0, 0);
    return ed.getTime() === d.getTime();
  });
}

const CALENDAR_DAYS = buildCalendarDays(-30, 400);

export function HomeScreen() {
  const router = useRouter();
  const { currency } = useAppState();
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const [events, setEvents] = useState([
    { id: "1", name: "Sarah", title: "Anniversary dinner", date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 4), amount: 220 },
    { id: "2", name: "Daniel", title: "Birthday gift", date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 9), amount: 130 },
    { id: "3", name: "Mom", title: "Mother's Day", date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 2), amount: 0 },
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [formWho, setFormWho] = useState("");
  const [formDate, setFormDate] = useState(new Date(TODAY.getTime() + 3 * 24 * 60 * 60 * 1000));
  const [formBudget, setFormBudget] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadEvents().then((stored) => {
      if (Array.isArray(stored) && stored.length > 0) setEvents(stored);
      setEventsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!eventsLoaded) return;
    saveEvents(events);
  }, [events, eventsLoaded]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );
  const dayEvents = useMemo(
    () => getEventsForDate(events, selectedDate),
    [events, selectedDate]
  );
  const upcoming = sortedEvents.filter((e) => daysUntil(e.date) >= 0);
  const nextEvent = upcoming[0] ?? sortedEvents[sortedEvents.length - 1];
  const daysToNext = nextEvent ? daysUntil(nextEvent.date) : null;

  useEffect(() => {
    const idx = CALENDAR_DAYS.findIndex((d) => d.toDateString() === selectedDate.toDateString());
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: Math.max(0, idx * (CARD_WIDTH + CARD_GAP) - Dimensions.get("window").width / 2 + CARD_WIDTH / 2),
        animated: true,
      });
    }
  }, [selectedDate]);

  function handleQuickAdd() {
    const who = formWho.trim() || "New person";
    const budget = parseFloat(formBudget) || 0;
    const d = new Date(formDate);
    d.setHours(12, 0, 0, 0);
    const newEvent = { id: Date.now().toString(), name: who, title: "Planned", date: d, amount: budget };
    setEvents((prev) => [...prev, newEvent]);
    setSelectedDate(d);
    setFormWho("");
    setFormDate(new Date(TODAY.getTime() + 3 * 24 * 60 * 60 * 1000));
    setFormBudget("");
    setSheetOpen(false);
    Keyboard.dismiss();
  }

  function selectDate(date) {
    lightTap();
    setSelectedDate(date);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Gem size={110} urgency={daysToNext} />
          <Text style={styles.gemLabel}>Timeline</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarStrip}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
        >
          {CALENDAR_DAYS.map((day) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === TODAY.toDateString();
            const hasEvents = getEventsForDate(events, day).length > 0;
            return (
              <Pressable
                key={day.getTime()}
                onPress={() => selectDate(day)}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                  isToday && !isSelected && styles.dayCardToday,
                ]}
              >
                {hasEvents && <View style={styles.dayDot} />}
                <Text style={[styles.dayMonth, isSelected && styles.dayTextSelected]}>{MONTH_NAMES[day.getMonth()]}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>
          {selectedDate.toDateString() === TODAY.toDateString()
            ? "Today"
            : selectedDate.toDateString() === new Date(TODAY.getTime() + 86400000).toDateString()
            ? "Tomorrow"
            : `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`}
        </Text>

        {dayEvents.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events for this day</Text>
          </GlassCard>
        ) : (
          dayEvents.map((ev) => {
            const days = daysUntil(ev.date);
            const urg = days === 0 ? colors.gemSunsetOrange : days <= 3 ? colors.neonPurple : colors.gemElectricBlue;
            return (
              <Pressable key={ev.id} onPress={() => { lightTap(); router.push(`/profile/${ev.id}`); }}>
                <GlassCard style={styles.eventCard}>
                  <View style={styles.eventLeft}>
                    <Text style={styles.eventName}>{ev.name}</Text>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                  </View>
                  <View style={styles.eventRight}>
                    {ev.amount > 0 && <Text style={styles.eventAmount}>{sym}{ev.amount}</Text>}
                    <Text style={[styles.eventUrgency, { color: urg }]}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </GlassCard>
              </Pressable>
            );
          })
        )}

        <Pressable
          style={({ pressed }) => [styles.quickAdd, pressed && styles.quickAddPressed]}
          onPress={() => { lightTap(); setSheetOpen(true); }}
        >
          <GlassCard style={styles.quickAddCard}>
            <Text style={styles.quickAddLabel}>Quick Add</Text>
            <Text style={styles.quickAddHint}>+ New commitment</Text>
          </GlassCard>
        </Pressable>
      </ScrollView>

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
              <Text style={styles.sheetTitle}>Quick Add</Text>
              <Text style={styles.sheetSubtitle}>Who? When? Estimated budget?</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Who?</Text>
                <NeonInput
                  placeholder="Name or relationship"
                  value={formWho}
                  onChangeText={setFormWho}
                  textCapitalization="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Select date</Text>
                <Pressable
                  onPress={() => { lightTap(); setDatePickerOpen(true); }}
                  style={styles.dateBtn}
                >
                  <Text style={styles.dateBtnText}>
                    {formDate.getDate()} {MONTH_NAMES[formDate.getMonth()]} {formDate.getFullYear()}
                  </Text>
                  <Text style={styles.dateBtnHint}>Select from calendar ›</Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Estimated budget?</Text>
                <NeonInput
                  placeholder="e.g. 220"
                  value={formBudget}
                  onChangeText={setFormBudget}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              <View style={styles.sheetButtons}>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnCancel]} onPress={() => setSheetOpen(false)}>
                  <Text style={styles.sheetBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnSave]} onPress={handleQuickAdd}>
                  <Text style={[styles.sheetBtnText, { color: colors.textPrimary }]}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      <GlassDatePickerModal
        visible={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(d) => setFormDate(d)}
        initialDate={formDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 40 },
  top: { alignItems: "center", marginBottom: 20 },
  gemLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 12, letterSpacing: 0.5 },
  calendarStrip: { paddingBottom: 20, paddingRight: 20 },
  dayCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  dayCardSelected: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderColor: colors.gemElectricBlue,
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  dayCardToday: { borderColor: "rgba(59,130,246,0.3)" },
  dayDot: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gemElectricBlue,
  },
  dayMonth: { color: colors.textSecondary, fontSize: 10, fontWeight: "600" },
  dayNum: { color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginTop: 4 },
  dayTextSelected: { color: colors.gemElectricBlue },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 12 },
  emptyCard: { paddingVertical: 24, alignItems: "center", marginBottom: 16 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  eventLeft: { flex: 1 },
  eventName: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  eventTitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  eventRight: { alignItems: "flex-end", marginRight: 8 },
  eventAmount: { color: colors.gemElectricBlue, fontSize: 13, fontWeight: "600" },
  eventUrgency: { fontSize: 11, marginTop: 2 },
  chevron: { color: colors.textSecondary, fontSize: 20, opacity: 0.5 },
  quickAdd: { marginTop: 16 },
  quickAddPressed: { opacity: 0.9 },
  quickAddCard: { paddingVertical: 18, paddingHorizontal: 24, alignItems: "center" },
  quickAddLabel: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  quickAddHint: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheetKAV: { maxHeight: "85%" },
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
  field: { marginBottom: 16 },
  fieldLabel: { color: colors.textPrimary, fontSize: 13, marginBottom: 8 },
  dateBtn: {
    marginTop: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dateBtnText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  dateBtnHint: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
  },
  dateChipSelected: {
    backgroundColor: "rgba(59,130,246,0.25)",
    borderWidth: 1,
    borderColor: colors.gemElectricBlue,
  },
  dateChipText: { color: colors.textSecondary, fontSize: 13 },
  dateChipTextSelected: { color: colors.gemElectricBlue, fontWeight: "600" },
  sheetButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  sheetBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  sheetBtnCancel: { backgroundColor: colors.surface },
  sheetBtnSave: { backgroundColor: colors.gemElectricBlue },
  sheetBtnText: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
});
