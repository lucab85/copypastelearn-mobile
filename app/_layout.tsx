import { View, Text } from "react-native";
import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { tokenCache } from "../src/services/tokenCache";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { OfflineBanner } from "../src/components/OfflineBanner";

// Sync TanStack Query online status with NetInfo (safe import)
try {
  const NetInfo = require("@react-native-community/netinfo").default;
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state: any) => {
      setOnline(!!state.isConnected);
    });
  });
} catch {
  // NetInfo unavailable — TanStack Query assumes online
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      networkMode: "offlineFirst",
    },
  },
});

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!CLERK_KEY) {
  console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — auth will not work");
}

export default function RootLayout() {
  if (!CLERK_KEY) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View>
          <View style={{ marginBottom: 16 }}>
            <View><Text style={{ fontSize: 40, textAlign: "center" }}>⚙️</Text></View>
          </View>
          <View><Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>Setup Required</Text></View>
          <View><Text style={{ fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 }}>
            Create a .env file with:{"\n\n"}
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...{"\n"}
            EXPO_PUBLIC_API_BASE_URL=https://...
          </Text></View>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <Slot />
            </View>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
