import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../theme/colors";
import { useAppState } from "../state/AppStateProvider";
import { Gem } from "../components/Gem";
import { PrimaryButton } from "../components/PrimaryButton";

const PREF_KEY = "primelink_biometric_preference"; // "unknown" | "enabled" | "disabled"

export function BiometricGate({ children }) {
  const { isPremium } = useAppState();

  // Biometric lock is a premium feature; free users skip this gate.
  if (!isPremium) {
    return children;
  }

  const [status, setStatus] = useState("loading"); // loading | choose | checking | failed | granted | unavailable
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const storedPref = await AsyncStorage.getItem(PREF_KEY);
      const preference = storedPref || "unknown";

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        setStatus("unavailable");
        return;
      }

      if (preference === "enabled") {
        await runAuth();
      } else if (preference === "disabled") {
        setStatus("granted");
      } else {
        setStatus("choose");
      }
    })();
  }, []);

  async function runAuth() {
    setStatus("checking");
    setErrorMessage("");

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock PrimeLink",
      cancelLabel: "Cancel",
      fallbackLabel: "Use device passcode",
    });

    if (result.success) {
      setStatus("granted");
    } else {
      setStatus("failed");
      setErrorMessage("Authentication failed. Please try again.");
    }
  }

  async function choosePreference(nextPref) {
    await AsyncStorage.setItem(PREF_KEY, nextPref);
    if (nextPref === "enabled") {
      await runAuth();
    } else {
      setStatus("granted");
    }
  }

  if (status === "granted" || status === "unavailable") {
    return children;
  }

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Gem size={120} />
        <Text style={styles.title}>Private relationship vault</Text>
        <Text style={styles.subtitle}>
          Choose if you want to unlock PrimeLink with Face ID or fingerprint.
        </Text>

        {status === "checking" && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.textPrimary} />
            <Text style={styles.loadingText}>Waiting for biometric check…</Text>
          </View>
        )}

        {status === "failed" && (
          <Text style={styles.error}>{errorMessage}</Text>
        )}
      </View>

      {status === "choose" && (
        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Not now"
            onPress={() => choosePreference("disabled")}
            style={[styles.button, { backgroundColor: colors.surfaceStrong }]}
          />
          <PrimaryButton
            label="Use biometrics"
            onPress={() => choosePreference("enabled")}
            style={styles.button}
          />
        </View>
      )}

      {status !== "choose" && (
        <PrimaryButton
          label={status === "checking" ? "Checking…" : "Unlock with biometrics"}
          onPress={status === "checking" ? undefined : runAuth}
          style={styles.singleButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  singleButton: {
    marginTop: 24,
  },
});

