import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

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
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/contact")}
          accessibilityRole="link"
        >
          <Text style={styles.rowText}>Contact Support</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/privacy")}
          accessibilityRole="link"
        >
          <Text style={styles.rowText}>Privacy Policy</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL("https://copypastelearn.com/terms")}
          accessibilityRole="link"
        >
          <Text style={styles.rowText}>Terms of Service</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  },
  rowText: { fontSize: 16, color: "#1a1a1a" },
  rowArrow: { fontSize: 20, color: "#ccc" },
  signOutButton: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#dc2626",
  },
  signOutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});
