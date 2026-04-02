import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../src/theme/colors";
import { GlassCard } from "../../src/core/components/GlassCard";
import { PrimaryButton } from "../../src/core/components/PrimaryButton";
import { useAppState } from "../../src/core/state/AppStateProvider";

const PREF_KEY = "primelink_biometric_preference";

export default function SettingsPage() {
  const router = useRouter();
  const { isPremium, currency, setCurrency } = useAppState();
  const [biometricPref, setBiometricPref] = useState("unknown");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState([]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(PREF_KEY);
      setBiometricPref(stored || "disabled");

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && enrolled);

      if (hasHardware) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        setSupportedTypes(types);
      }
    })();
  }, []);

  function biometricLabel() {
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    }
    return "Biometrics";
  }

  async function toggleBiometrics() {
    if (!isPremium) return;

    if (!biometricAvailable) {
      Alert.alert(
        "Biometrics unavailable",
        "Your device does not support or has not enrolled any biometric authentication.",
        [{ text: "OK" }]
      );
      return;
    }

    if (biometricPref !== "enabled") {
      // Turning ON — require biometric verification first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verify ${biometricLabel()} to enable lock`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use device passcode",
      });

      if (!result.success) {
        // Auth failed or cancelled — don't enable
        return;
      }

      await AsyncStorage.setItem(PREF_KEY, "enabled");
      setBiometricPref("enabled");
    } else {
      // Turning OFF — require biometric verification first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verify ${biometricLabel()} to disable lock`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use device passcode",
      });

      if (!result.success) return;

      await AsyncStorage.setItem(PREF_KEY, "disabled");
      setBiometricPref("disabled");
    }
  }

  function CurrencyOption({ code, label }) {
    const active = currency === code;
    return (
      <Pressable
        onPress={() => setCurrency(code)}
        style={[styles.currencyChip, active && styles.currencyChipActive]}
      >
        <Text style={[styles.currencyLabel, active && styles.currencyLabelActive]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  const biometricsEnabled = biometricPref === "enabled";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["transparent", "rgba(168,85,247,0.02)", "transparent"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Tune how PrimeLink protects your data and displays amounts.
      </Text>

      {/* Security */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>
              {`Unlock with ${biometricLabel()}`}
            </Text>
            {!isPremium && (
              <Text style={styles.rowHelper}>
                Available with Premium. Your data is still stored locally.
              </Text>
            )}
            {isPremium && !biometricAvailable && (
              <Text style={styles.rowHelper}>
                No biometric authentication available on this device.
              </Text>
            )}
            {isPremium && biometricAvailable && biometricsEnabled && (
              <Text style={[styles.rowHelper, { color: colors.success }]}>
                {`${biometricLabel()} lock is active. App will require authentication on launch.`}
              </Text>
            )}
          </View>
          <Pressable
            onPress={toggleBiometrics}
            disabled={!isPremium}
            style={[
              styles.toggle,
              biometricsEnabled && styles.toggleOn,
              !isPremium && styles.toggleDisabled,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                biometricsEnabled && styles.toggleThumbOn,
              ]}
            />
          </Pressable>
        </View>
      </GlassCard>

      {/* Currency */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <Text style={styles.rowHelper}>
          Choose how amounts are displayed across PrimeLink.
        </Text>
        <View style={styles.currencyRow}>
          <CurrencyOption code="USD" label="USD $" />
          <CurrencyOption code="EUR" label="EUR \u20AC" />
          <CurrencyOption code="TRY" label="TRY \u20BA" />
        </View>
      </GlassCard>

      <PrimaryButton
        label="Done"
        onPress={() => router.back()}
        style={styles.doneButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  card: { marginBottom: 16 },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { color: colors.textPrimary, fontSize: 14 },
  rowHelper: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(148, 163, 184, 0.35)",
    padding: 3,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: colors.gemElectricBlue },
  toggleDisabled: { opacity: 0.4 },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0F172A",
    alignSelf: "flex-start",
  },
  toggleThumbOn: { alignSelf: "flex-end", backgroundColor: "#FFFFFF" },
  currencyRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  currencyChipActive: {
    backgroundColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.4)",
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  currencyLabel: { color: colors.textSecondary, fontSize: 12 },
  currencyLabelActive: { color: colors.textPrimary },
  doneButton: { marginTop: 8 },
});
