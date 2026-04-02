import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { Gem } from "../../core/components/Gem";
import { GlassCard } from "../../core/components/GlassCard";
import { PrimaryButton } from "../../core/components/PrimaryButton";
import { NeonInput } from "../../core/components/NeonInput";
import { useAppState } from "../../core/state/AppStateProvider";
import { lightTap } from "../../core/utils/haptics";
import { loadEvents, saveEvents } from "../../core/storage/persistence";

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", TRY: "₺" };

const TODAY = new Date();
const DAY_MS = 24 * 60 * 60 * 1000;
const CARD_WIDTH = 72;
const CARD_GAP = 10;
const PADDING_H = 20;

const MOCK_EVENTS = [
  {
    id: "1",
    name: "Sarah",
    title: "Anniversary dinner",
    date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 4),
    amount: 220,
  },
  {
    id: "2",
    name: "Daniel",
    title: "Birthday gift",
    date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 9),
    amount: 130,
  },
  {
    id: "3",
    name: "Mom",
    title: "Mother's Day",
    date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 2),
    amount: 0,
  },
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getEventsForDate(events, date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return events.filter((e) => {
    const ed = new Date(e.date);
    ed.setHours(0, 0, 0, 0);
    return ed.getTime() === d.getTime();
  });
}

function buildCalendarDays(startOffset, count) {
  const days = [];
  const base = new Date(TODAY);
  base.setHours(0, 0, 0, 0);
  for (let i = startOffset; i < startOffset + count; i++) {
    const d = new Date(base.getTime() + i * DAY_MS);
    days.push(d);
  }
  return days;
}

function daysUntil(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date(TODAY);
  today.setHours(0, 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

const CALENDAR_DAYS = buildCalendarDays(-14, 60);

export function RelationshipDashboardScreen() {
  const router = useRouter();
  const { currency } = useAppState();
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    loadEvents().then((stored) => {
      if (Array.isArray(stored) && stored.length > 0) {
        setEvents(stored);
      }
      setEventsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!eventsLoaded) return;
    saveEvents(events);
  }, [events, eventsLoaded]);
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDaysAhead, setFormDaysAhead] = useState("3");
  const [formAmount, setFormAmount] = useState("");

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events]
  );

  const nextEvent = sortedEvents[0];
  const daysToNext = nextEvent ? daysUntil(nextEvent.date) : 0;

  function handleAddInteraction() {
    const name = formName.trim() || "New connection";
    const title = formTitle.trim() || "Planned interaction";
    const daysAhead = parseInt(formDaysAhead, 10);
    const amount = parseFloat(formAmount) || 0;
    const date = new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() + (isNaN(daysAhead) ? 0 : daysAhead)
    );

    const newEvent = {
      id: Date.now().toString(),
      name,
      title,
      date,
      amount,
    };
    setEvents((prev) => [...prev, newEvent]);
    setFormName("");
    setFormTitle("");
    setFormDaysAhead("3");
    setFormAmount("");
    setSheetOpen(false);
  }

  const header = (
    <View style={styles.topSection}>
      <View style={styles.gemSection}>
        <Gem size={120} urgency={daysToNext} />
        <Text style={styles.gemLabel}>Relationship focus today</Text>
        <Text style={styles.focusValue}>
          {!nextEvent
            ? "No upcoming events"
            : daysToNext === 0
            ? "Important day is today"
            : `${daysToNext} day${daysToNext === 1 ? "" : "s"} until ${
                nextEvent.name
              }'s next event`}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <GlassCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Upcoming</Text>
          <Text style={styles.metricValue}>
            {sortedEvents.length} event
            {sortedEvents.length === 1 ? "" : "s"}
          </Text>
        </GlassCard>
      </View>

      <View style={styles.calendarSection}>
        <Text style={styles.calendarLabel}>Timeline</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScroll}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
        >
          {CALENDAR_DAYS.map((day) => {
            const dayEvents = getEventsForDate(events, day);
            const isToday =
              day.toDateString() === TODAY.toDateString();
            return (
              <View
                key={day.getTime()}
                style={[
                  styles.dayCard,
                  isToday && styles.dayCardToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayDate,
                    isToday && styles.dayDateToday,
                  ]}
                >
                  {MONTH_NAMES[day.getMonth()]} {day.getDate()}
                </Text>
                {dayEvents.length > 0 ? (
                  dayEvents.map((ev) => (
                    <Text
                      key={ev.id}
                      style={styles.dayEvent}
                      numberOfLines={1}
                    >
                      {ev.title}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.dayEmpty}>—</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Next commitments</Text>
        <Text style={styles.listSubtitle}>Sorted by urgency</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["transparent", "rgba(59,130,246,0.03)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton
              label="Add New Interaction"
              onPress={() => setSheetOpen(true)}
            />
          </View>
        }
        renderItem={({ item }) => {
          const days = daysUntil(item.date);
          const urgentColor = days === 0 ? colors.gemSunsetOrange : days <= 3 ? colors.neonPurple : colors.gemElectricBlue;
          return (
            <Pressable onPress={() => { lightTap(); router.push(`/profile/${item.id}`); }}>
              <GlassCard style={styles.contactCard}>
                <View style={styles.contactLeft}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactLabel}>{item.title}</Text>
                </View>
                <View style={styles.contactRight}>
                  <Text style={[styles.contactUrgency, { color: urgentColor }]}>
                    {days === 0 ? "Today" : `in ${days} day${days === 1 ? "" : "s"}`}
                  </Text>
                  {item.amount > 0 && (
                    <Text style={styles.contactAmount}>{sym}{item.amount}</Text>
                  )}
                </View>
                <Text style={styles.chevron}>{"\u203A"}</Text>
              </GlassCard>
            </Pressable>
          );
        }}
      />
      {sheetOpen && (
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setSheetOpen(false)}
          />
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
              <Text style={styles.sheetTitle}>Log new interaction</Text>
              <Text style={styles.sheetSubtitle}>
                Capture a gift, dinner, or moment you are planning.
              </Text>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Name</Text>
                <NeonInput
                  placeholder="Who is this for?"
                  value={formName}
                  onChangeText={setFormName}
                  textCapitalization="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Event</Text>
                <NeonInput
                  placeholder="e.g. Anniversary dinner"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>In how many days?</Text>
                <NeonInput
                  placeholder="e.g. 4"
                  keyboardType="numeric"
                  value={formDaysAhead}
                  onChangeText={setFormDaysAhead}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.sheetField}>
                <Text style={styles.fieldLabel}>Planned budget</Text>
                <NeonInput
                  placeholder="e.g. 220"
                  keyboardType="numeric"
                  value={formAmount}
                  onChangeText={setFormAmount}
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
                  onPress={handleAddInteraction}
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
  topSection: {
    marginBottom: 24,
  },
  gemSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  gemLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 16,
  },
  focusValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  calendarSection: {
    marginTop: 20,
  },
  calendarLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  calendarScroll: {
    paddingRight: PADDING_H,
  },
  dayCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(8,10,18,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dayCardToday: {
    borderColor: "rgba(59,130,246,0.4)",
    backgroundColor: "rgba(59,130,246,0.08)",
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  dayDate: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dayDateToday: {
    color: colors.gemElectricBlue,
  },
  dayEvent: {
    color: colors.textPrimary,
    fontSize: 11,
    lineHeight: 14,
  },
  dayEmpty: {
    color: colors.textSecondary,
    fontSize: 11,
    opacity: 0.5,
  },
  listHeader: {
    marginBottom: 8,
  },
  listTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  listSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactLeft: {
    flex: 1,
  },
  contactName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  contactLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.95,
  },
  contactRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  contactUrgency: {
    fontSize: 12,
    fontWeight: "600",
  },
  contactAmount: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 22,
    opacity: 0.4,
  },
  footer: {
    marginTop: 16,
    marginBottom: 24,
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

