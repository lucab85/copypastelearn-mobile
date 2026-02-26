import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useApiClient } from "../../../src/services/apiClient";
import { SkeletonBox, SkeletonLessonRow } from "../../../src/components/SkeletonBox";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { ProgressRing } from "../../../src/components/ProgressRing";
import { AnalyticsEvent, track } from "../../../src/services/analytics";
import { colors, typography, spacing, radii, shadows, getGradientColor } from "../../../src/theme";
import type { LessonSummary } from "../../../src/services/types";

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const api = useApiClient();
  const router = useRouter();

  const { data: course, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.getCourse(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (course) {
      track(AnalyticsEvent.COURSE_VIEW, { courseSlug: slug, courseId: course.id });
    }
  }, [course, slug]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={styles.skeletonHeader}>
          <SkeletonBox width="70%" height={24} style={{ marginBottom: 12 }} />
          <SkeletonBox width="40%" height={16} />
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLessonRow key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load course</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lessons = course.lessons;
  const completedCount = lessons.filter((l) => l.userProgress?.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const gradientColor = getGradientColor(course.title);

  // Find first incomplete lesson for CTA
  const nextLesson = lessons.find((l) => l.isAccessible && !l.userProgress?.completed);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const min = Math.floor(seconds / 60);
    return `${min} min`;
  };

  const getStatusIcon = (item: LessonSummary) => {
    if (item.userProgress?.completed) return "✓";
    if (!item.isAccessible) return "🔒";
    if (item.userProgress?.videoPositionSeconds && item.userProgress.videoPositionSeconds > 0) return "▶";
    return "";
  };

  const renderLesson = ({ item, index }: { item: LessonSummary; index: number }) => (
    <TouchableOpacity
      style={[styles.lessonCard, !item.isAccessible && styles.lockedCard]}
      onPress={() => {
        if (item.isAccessible) {
          router.push(`/lesson/${slug}/${item.slug}`);
        }
      }}
      disabled={!item.isAccessible}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${index + 1}: ${item.title}${!item.isAccessible ? ", locked" : ""}`}
    >
      <View style={styles.lessonRow}>
        {/* Number / Status */}
        <View style={[
          styles.lessonNumber,
          item.userProgress?.completed && styles.lessonNumberDone,
        ]}>
          {item.userProgress?.completed ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={[styles.numberText, !item.isAccessible && styles.lockedText]}>{index + 1}</Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, !item.isAccessible && styles.lockedText]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.lessonMeta}>
            {item.durationSeconds ? (
              <Text style={styles.duration}>
                {item.userProgress && !item.userProgress.completed && item.userProgress.videoPositionSeconds > 0
                  ? `${formatDuration(item.userProgress.videoPositionSeconds)} / ${formatDuration(item.durationSeconds)}`
                  : formatDuration(item.durationSeconds)}
              </Text>
            ) : null}
            {item.isFree && <Text style={styles.freeBadge}>Free</Text>}
            {item.hasLab && <Text style={styles.labBadge}>🔬 Lab on web</Text>}
          </View>

          {/* Mini progress bar for in-progress lessons */}
          {item.userProgress && !item.userProgress.completed &&
            item.userProgress.videoPositionSeconds > 0 && item.durationSeconds && (
              <View style={styles.miniProgress}>
                <ProgressBar
                  progress={(item.userProgress.videoPositionSeconds / item.durationSeconds) * 100}
                  height={3}
                  color={colors.accent}
                />
              </View>
            )}
        </View>

        {/* Arrow */}
        {item.isAccessible && (
          <Text style={styles.arrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: course.title, headerBackTitle: "Catalog" }} />

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            {/* Hero Header */}
            <View style={[styles.heroHeader, { backgroundColor: gradientColor }]}>
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{course.title}</Text>
                <Text style={styles.heroMeta}>
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  {course.instructor ? ` • ${course.instructor}` : ""}
                </Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={[styles.progressSection, shadows.subtle]}>
              <ProgressRing progress={progressPercent} size={60} strokeWidth={5} />
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>
                  {progressPercent === 100
                    ? "Course Complete! 🎉"
                    : `${completedCount} of ${lessons.length} lessons`}
                </Text>
                <ProgressBar progress={progressPercent} height={6} style={styles.progressBarFull} />
              </View>
            </View>

            {/* Description */}
            {course.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>About this course</Text>
                <Text style={styles.description}>{course.description}</Text>
              </View>
            )}

            <Text style={styles.lessonsHeader}>Lessons</Text>
          </>
        }
        ListFooterComponent={<View style={{ height: nextLesson ? 80 : spacing.xxl }} />}
      />

      {/* Sticky CTA */}
      {nextLesson && (
        <View style={[styles.stickyCta, shadows.elevated]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push(`/lesson/${slug}/${nextLesson.slug}`)}
            accessibilityLabel={`Continue: ${nextLesson.title}`}
          >
            <Text style={styles.ctaText}>
              {completedCount > 0 ? "Continue Learning ▶" : "Start Learning ▶"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.md },

  // Hero
  heroHeader: {
    height: 160,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: spacing.lg,
  },
  heroTitle: { ...typography.h1, color: colors.textInverse, marginBottom: spacing.xs },
  heroMeta: { ...typography.bodySm, color: "rgba(255,255,255,0.8)" },

  // Progress
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  progressInfo: { flex: 1 },
  progressTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.sm },
  progressBarFull: { marginTop: 0 },

  // Description
  descriptionSection: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  descriptionTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary },

  lessonsHeader: { ...typography.h3, color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.sm },

  // Lesson card
  lessonCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  lockedCard: { opacity: 0.6 },
  lessonRow: { flexDirection: "row", alignItems: "center", padding: spacing.md },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  lessonNumberDone: { backgroundColor: colors.successBg },
  numberText: { ...typography.bodyMedium, color: colors.textSecondary },
  checkmark: { fontSize: 16, fontWeight: "700", color: colors.success },
  lessonInfo: { flex: 1 },
  lessonTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: 2 },
  lockedText: { color: colors.textTertiary },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  duration: { ...typography.bodySm, color: colors.textTertiary },
  freeBadge: { ...typography.captionSm, color: colors.success },
  labBadge: { ...typography.caption, color: "#7c3aed" },
  miniProgress: { marginTop: spacing.xs },
  arrow: { fontSize: 24, color: colors.textTertiary, marginLeft: spacing.sm },

  // Skeleton
  skeletonHeader: { padding: spacing.lg },

  // Sticky CTA
  stickyCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
  },
  ctaText: { ...typography.button, color: colors.textInverse },

  // Error
  errorEmoji: { fontSize: 40, marginBottom: spacing.md },
  errorText: { ...typography.body, color: colors.error, marginBottom: spacing.md },
  retryButton: { padding: spacing.md },
  retryText: { ...typography.button, color: colors.primary },
});
