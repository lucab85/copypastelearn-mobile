import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { colors, typography, spacing, radii, shadows, getGradientColor } from "../theme";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  title: string;
  slug: string;
  lessonCount: number;
  imageUrl?: string | null;
  category?: string;
  totalDuration?: string;
  progress?: number; // 0-100
  isFree?: boolean;
  onPress: () => void;
}

export function CourseCard({
  title,
  slug,
  lessonCount,
  imageUrl,
  category,
  totalDuration,
  progress,
  isFree,
  onPress,
}: CourseCardProps) {
  const gradientColor = getGradientColor(title);

  return (
    <TouchableOpacity
      style={[styles.card, shadows.card]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${lessonCount} lessons${progress ? `, ${Math.round(progress)}% complete` : ""}`}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: gradientColor }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
        ) : (
          <Text style={styles.thumbnailEmoji}>📚</Text>
        )}
        {isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {category && (
          <Text style={styles.category} numberOfLines={1}>{category}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
          </Text>
          {totalDuration && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{totalDuration}</Text>
            </>
          )}
        </View>

        {progress !== undefined && progress > 0 && (
          <View style={styles.progressRow}>
            <ProgressBar progress={progress} height={4} />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
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
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  thumbnail: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailEmoji: {
    fontSize: 40,
    opacity: 0.6,
  },
  freeBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  freeBadgeText: {
    ...typography.captionSm,
    color: colors.textInverse,
  },
  content: {
    padding: spacing.md,
  },
  category: {
    ...typography.captionSm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  metaDot: {
    ...typography.bodySm,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 36,
    textAlign: "right",
  },
});
