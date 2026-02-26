import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, typography, spacing, radii } from "../../src/theme";
import { hapticLight } from "../../src/services/haptics";

const AUTOPLAY_KEY = "settings:autoplay";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTOPLAY_KEY).then((val) => {
      if (val !== null) setAutoplayEnabled(val === "true");
    });
  }, []);

  const toggleAutoplay = (value: boolean) => {
    setAutoplayEnabled(value);
    hapticLight();
    AsyncStorage.setItem(AUTOPLAY_KEY, String(value));
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowText}>Autoplay Next Lesson</Text>
            <Text style={styles.rowHint}>Auto-continue after lesson completes</Text>
          </View>
          <Switch
            value={autoplayEnabled}
            onValueChange={toggleAutoplay}
            trackColor={{ true: "#2563eb", false: "#e5e7eb" }}
            accessibilityLabel="Autoplay next lesson"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/contact")}
          accessibilityRole="link"
          accessibilityLabel="Contact support"
        >
          <Text style={styles.rowText}>Contact Support</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("mailto:support@copypastelearn.com?subject=Mobile App Feedback")}
          accessibilityRole="link"
          accessibilityLabel="Send feedback"
        >
          <Text style={styles.rowText}>Send Feedback</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/privacy")}
          accessibilityRole="link"
          accessibilityLabel="Privacy policy"
        >
          <Text style={styles.rowText}>Privacy Policy</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/terms")}
          accessibilityRole="link"
          accessibilityLabel="Terms of service"
        >
          <Text style={styles.rowText}>Terms of Service</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CopyPasteLearn Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16 },
  profileCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 24,
    alignItems: "center", marginBottom: 24,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#2563eb",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#999", textTransform: "uppercase", marginBottom: 8, marginLeft: 4 },
  row: {
    backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 2,
    minHeight: 52,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowText: { fontSize: 16, color: "#1a1a1a" },
  rowHint: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  rowArrow: { fontSize: 20, color: "#ccc" },
  signOutButton: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#dc2626",
    minHeight: 52,
  },
  signOutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
  version: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 24, marginBottom: 32 },
});
