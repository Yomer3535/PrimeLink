import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { Gem } from "../../src/core/components/Gem";
import { PrimaryButton } from "../../src/core/components/PrimaryButton";
import { useRouter } from "expo-router";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Gem />
        <Text style={styles.title}>Welcome to PrimeLink</Text>
        <Text style={styles.text}>
          PrimeLink helps you stay deeply connected to the people who matter most, and aligned with
          the way you invest your time and money in them.
        </Text>
      </View>

      <PrimaryButton
        label="Begin with your first connection"
        onPress={() => router.replace("/")}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
  },
});

