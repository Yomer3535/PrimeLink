import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { lightTap } from "../utils/haptics";

const DEEP_PURPLE = "#7C3AED";
const SOFT_PINK = "#EC4899";
const TRANSLUCENT_BLACK = "rgba(0,0,0,0.85)";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildDaysInMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  return days;
}

export function GlassDatePickerModal({ visible, onClose, onSelect, initialDate }) {
  const d = initialDate ? new Date(initialDate) : new Date();
  const [year, setYear] = useState(d.getFullYear());
  const [month, setMonth] = useState(d.getMonth());
  const [day, setDay] = useState(d.getDate());

  const days = buildDaysInMonth(year, month);
  const maxDay = new Date(year, month + 1, 0).getDate();
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [year, month, maxDay]);

  function handleDayPress(d) {
    if (d) {
      lightTap();
      setDay(d);
    }
  }

  function handleConfirm() {
    lightTap();
    const date = new Date(year, month, day);
    date.setHours(12, 0, 0, 0);
    onSelect?.(date);
    onClose?.();
  }

  const { height } = Dimensions.get("window");
  const sheetHeight = Math.min(height * 0.8, 480);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={s.root}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <Pressable
          style={[s.sheet, { height: sheetHeight }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={s.gradient}>
          <View style={s.handle} />
          <Text style={s.title}>Select Date</Text>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.pickerRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pickerScroll}
              >
                {years.map((y) => (
                  <Pressable
                    key={y}
                    onPress={() => { lightTap(); setYear(y); }}
                    style={[s.pickerChip, year === y && s.pickerChipActive]}
                  >
                    <Text style={[s.pickerChipText, year === y && s.pickerChipTextActive]}>{y}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={s.pickerRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pickerScroll}
              >
                {MONTHS.map((m, i) => (
                  <Pressable
                    key={m}
                    onPress={() => { lightTap(); setMonth(i); }}
                    style={[s.pickerChip, month === i && s.pickerChipActive]}
                  >
                    <Text style={[s.pickerChipText, month === i && s.pickerChipTextActive]}>{m}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={s.weekdayRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={s.weekday}>{w}</Text>
              ))}
            </View>

            <View style={s.grid}>
              {days.map((dayNum, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleDayPress(dayNum)}
                  style={[
                    s.dayCell,
                    dayNum === day && s.dayCellSelected,
                    !dayNum && s.dayCellEmpty,
                  ]}
                >
                  <Text
                    style={[
                      s.dayText,
                      dayNum === day && s.dayTextSelected,
                      !dayNum && s.dayTextEmpty,
                    ]}
                  >
                    {dayNum || ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={s.footer}>
            <Pressable style={s.confirmBtn} onPress={handleConfirm}>
              <Text style={s.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "#1a0f2e",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  scroll: { flex: 1, maxHeight: 360 },
  scrollContent: { paddingBottom: 16 },
  pickerRow: { marginBottom: 12 },
  pickerScroll: { gap: 8, paddingVertical: 4 },
  pickerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
  },
  pickerChipActive: {
    backgroundColor: "rgba(124,58,237,0.4)",
    borderWidth: 1,
    borderColor: DEEP_PURPLE,
  },
  pickerChipText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  pickerChipTextActive: { color: SOFT_PINK, fontWeight: "600" },
  weekdayRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellEmpty: { opacity: 0 },
  dayCellSelected: {
    backgroundColor: "rgba(236,72,153,0.35)",
    borderRadius: 20,
  },
  dayText: { color: "#fff", fontSize: 14 },
  dayTextEmpty: { color: "transparent" },
  dayTextSelected: { color: SOFT_PINK, fontWeight: "700" },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(124,58,237,0.6)",
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
