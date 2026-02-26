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
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, typography, spacing, radii, shadows } from "@/theme";
import { hapticLight, hapticMedium } from "@/services/haptics";

const AUTOPLAY_KEY = "settings:autoplay";

interface SettingsRowProps {
  icon: string;
  label: string;
  hint?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingsRow({ icon, label, hint, onPress, right }: SettingsRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowLeft}>
        <Text style={styles.rowText}>{label}</Text>
        {hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {right ?? <Text style={styles.rowArrow}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} accessibilityLabel={label} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

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
    hapticMedium();
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const initials =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ??
    "?";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={[styles.profileCard, shadows.card]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Playback Section */}
        <Text style={styles.sectionTitle}>PLAYBACK</Text>
        <View style={[styles.sectionCard, shadows.subtle]}>
          <SettingsRow
            icon="▶️"
            label="Autoplay Next Lesson"
            hint="Automatically play the next lesson after completion"
            right={
              <Switch
                value={autoplayEnabled}
                onValueChange={toggleAutoplay}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={autoplayEnabled ? colors.surface : colors.textTertiary}
                accessibilityLabel="Autoplay next lesson"
              />
            }
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={[styles.sectionCard, shadows.subtle]}>
          <SettingsRow
            icon="💬"
            label="Contact Support"
            onPress={() => Linking.openURL("https://copypastelearn.com/contact")}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="📝"
            label="Send Feedback"
            hint="Help us improve the app"
            onPress={() => Linking.openURL("mailto:support@copypastelearn.com?subject=Mobile App Feedback")}
          />
        </View>

        {/* Legal Section */}
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={[styles.sectionCard, shadows.subtle]}>
          <SettingsRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://copypastelearn.com/privacy")}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="📄"
            label="Terms of Service"
            onPress={() => Linking.openURL("https://copypastelearn.com/terms")}
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version Footer */}
        <Text style={styles.version}>CopyPasteLearn Mobile v1.0.0</Text>
        <Text style={styles.versionSub}>Made with ❤️ by CopyPasteLearn</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  // Profile
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { ...typography.h2, color: colors.textInverse },
  profileInfo: { marginLeft: spacing.md, flex: 1 },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },

  // Sections
  sectionTitle: {
    ...typography.captionSm,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    minHeight: 52,
  },
  rowIcon: { fontSize: 18, marginRight: spacing.sm, width: 28 },
  rowLeft: { flex: 1, marginRight: spacing.sm },
  rowText: { ...typography.body, color: colors.text },
  rowHint: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  rowArrow: { fontSize: 22, color: colors.textTertiary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 52 },

  // Sign Out
  signOutButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
    minHeight: 52,
    marginTop: spacing.sm,
  },
  signOutText: { ...typography.button, color: colors.error },

  // Footer
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  versionSub: {
    ...typography.captionSm,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
});
