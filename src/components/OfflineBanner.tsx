import { View, Text, StyleSheet } from "react-native";
import { useNetworkState } from "../hooks/useNetworkState";

export function OfflineBanner() {
  const { isConnected } = useNetworkState();

  if (isConnected) return null;

  return (
    <View style={styles.banner} accessibilityLabel="You are offline" accessibilityRole="alert">
      <Text style={styles.text}>📡 You're offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#fef3c7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    color: "#92400e",
    fontSize: 13,
    fontWeight: "600",
  },
});
