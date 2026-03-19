import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useEffect } from "react";
import { SessionProvider, useSession } from "./contexts/auth/ctx";
import { GPSProvider } from "./contexts/gps/GPSContext";
import { HealthKitProvider } from "./contexts/healthkit/HealthKitContext";
import { startLocationTask } from "./tasks/locationTask";


export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
    useEffect(() => {
    startLocationTask();
  }, []);
  
  return (
    <SessionProvider>
      <HealthKitProvider>
        <GPSProvider>
        <RootNavigator />
        <StatusBar style="auto" />
        </GPSProvider>
      </HealthKitProvider>
    </SessionProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
