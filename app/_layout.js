import { Slot } from "expo-router";
import { BiometricGate } from "../src/core/security/BiometricGate";
import { AppStateProvider } from "../src/core/state/AppStateProvider";
import { SplashGate } from "../src/core/components/SplashGate";

export default function RootLayout() {
  return (
    <AppStateProvider>
      <SplashGate>
        <BiometricGate>
          <Slot />
        </BiometricGate>
      </SplashGate>
    </AppStateProvider>
  );
}
