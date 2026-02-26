import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { colors, typography, spacing, radii, shadows, getGradientColor } from "../theme";
import { ProgressRing } from "./ProgressRing";

interface HeroCardProps {
  courseTitle: string;
  lessonTitle: string;
  courseSlug: string;
  lessonSlug: string;
  imageUrl?: string | null;
  progress: number; // 0-100
  onPress: () => void;
}

export function HeroCard({
  courseTitle,
  lessonTitle,
  courseSlug,
  lessonSlug,
  imageUrl,
  progress,
  onPress,
}: HeroCardProps) {
  const gradientColor = getGradientColor(courseTitle);

  return (
    <TouchableOpacity
      style={[styles.card, shadows.elevated]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Continue ${courseTitle}, ${lessonTitle}`}
    >
      {/* Left: thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: gradientColor }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
        ) : (
          <Text style={styles.thumbnailEmoji}>▶️</Text>
        )}
      </View>

      {/* Right: info */}
      <View style={styles.info}>
        <Text style={styles.label}>CONTINUE LEARNING</Text>
        <Text style={styles.courseTitle} numberOfLines={1}>{courseTitle}</Text>
        <Text style={styles.lessonTitle} numberOfLines={1}>{lessonTitle}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.resumeBtn}>
            <Text style={styles.resumeText}>Resume ▶</Text>
          </View>
        </View>
      </View>

      {/* Progress ring */}
      <View style={styles.ringContainer}>
        <ProgressRing progress={progress} size={44} strokeWidth={4} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  thumbnail: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    padding: spacing.md,
    paddingRight: spacing.xs,
    justifyContent: "center",
  },
  label: {
    ...typography.captionSm,
    color: colors.accent,
    marginBottom: 2,
  },
  courseTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  lessonTitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resumeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  resumeText: {
    ...typography.buttonSm,
    color: colors.textInverse,
  },
  ringContainer: {
    justifyContent: "center",
    paddingRight: spacing.md,
  },
});
