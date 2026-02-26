import { View, Text, StyleSheet, StatusBar } from "react-native";
import { Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { tokenCache } from "../src/services/tokenCache";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { OfflineBanner } from "../src/components/OfflineBanner";
import { colors, typography, spacing, radii } from "../src/theme";

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
      <View style={setupStyles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={setupStyles.logoCircle}>
          <Text style={setupStyles.logoText}>CPL</Text>
        </View>
        <Text style={setupStyles.title}>Setup Required</Text>
        <Text style={setupStyles.body}>
          Create a <Text style={setupStyles.code}>.env</Text> file in the project root:
        </Text>
        <View style={setupStyles.codeBlock}>
          <Text style={setupStyles.codeText}>
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...{"\n"}
            EXPO_PUBLIC_API_BASE_URL=https://...
          </Text>
        </View>
        <Text style={setupStyles.hint}>Then restart the development server</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <OfflineBanner />
              <Slot />
            </View>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

const setupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoText: {
    ...typography.h3,
    color: colors.textInverse,
    fontWeight: "800",
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: colors.border,
    paddingHorizontal: 4,
  },
  codeBlock: {
    backgroundColor: colors.textPrimary ?? "#1e293b",
    padding: spacing.md,
    borderRadius: radii.md,
    width: "100%",
    marginBottom: spacing.md,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#e2e8f0",
    lineHeight: 20,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
