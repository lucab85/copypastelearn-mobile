import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApiClient } from "@/services/apiClient";
import { SkeletonDashboard } from "@/components/SkeletonBox";
import { HeroCard } from "@/components/HeroCard";
import { CourseCard } from "@/components/CourseCard";
import { ProgressBar } from "@/components/ProgressBar";
import { AnalyticsEvent, track } from "@/services/analytics";
import { colors, typography, spacing, radii, shadows, getGreeting } from "@/theme";
import type { DashboardData, DashboardCourse } from "@/services/types";

export default function DashboardScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { user } = useUser();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  useEffect(() => {
    track(AnalyticsEvent.CATALOG_VIEW);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <SkeletonDashboard />
      </SafeAreaView>
    );
  }

  const firstName = data?.userName ?? user?.firstName ?? "there";
  const inProgress = data?.inProgressCourses ?? [];
  const completed = data?.completedCourses ?? [];
  const recentLessons = data?.recentLessons ?? [];
  const totalCompleted = data?.totalLessonsCompleted ?? 0;

  // Find the most recently accessed in-progress course with a next lesson
  const continueCourse = inProgress.find((c) => c.nextLesson);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
          <Text style={styles.subtitle}>
            {inProgress.length > 0
              ? `${inProgress.length} course${inProgress.length > 1 ? "s" : ""} in progress`
              : totalCompleted > 0
              ? `${totalCompleted} lessons completed 🎉`
              : "Ready to start learning?"}
          </Text>
        </View>

        {/* Continue Learning Hero */}
        {continueCourse && continueCourse.nextLesson && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONTINUE LEARNING</Text>
            <HeroCard
              courseTitle={continueCourse.title}
              lessonTitle={continueCourse.nextLesson.title}
              courseSlug={continueCourse.slug}
              lessonSlug={continueCourse.nextLesson.slug}
              imageUrl={continueCourse.thumbnailUrl}
              progress={continueCourse.percentComplete}
              onPress={() => router.push(`/lesson/${continueCourse.slug}/${continueCourse.nextLesson!.slug}`)}
            />
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadows.subtle]}>
            <Text style={styles.statNumber}>{inProgress.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, shadows.subtle]}>
            <Text style={styles.statNumber}>{completed.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, shadows.subtle]}>
            <Text style={styles.statNumber}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>

        {/* Recent Activity */}
        {recentLessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Recent Activity</Text>
            {recentLessons.slice(0, 5).map((lesson) => (
              <TouchableOpacity
                key={lesson.lessonId}
                style={[styles.recentCard, shadows.subtle]}
                onPress={() => router.push(`/lesson/${lesson.courseSlug}/${lesson.slug}`)}
                accessibilityLabel={`${lesson.title} from ${lesson.courseTitle}`}
              >
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{lesson.title}</Text>
                  <Text style={styles.recentCourse} numberOfLines={1}>{lesson.courseTitle}</Text>
                </View>
                {lesson.completed ? (
                  <Text style={styles.recentDone}>✓</Text>
                ) : (
                  <Text style={styles.recentArrow}>›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* In Progress Courses */}
        {inProgress.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 In Progress</Text>
              <TouchableOpacity onPress={() => router.push("/catalog")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {inProgress.map((course: DashboardCourse) => (
              <TouchableOpacity
                key={course.courseId}
                style={[styles.courseRow, shadows.subtle]}
                onPress={() => router.push(`/catalog/${course.slug}`)}
                accessibilityLabel={`${course.title}, ${Math.round(course.percentComplete)}% complete`}
              >
                <View style={styles.courseRowInfo}>
                  <Text style={styles.courseRowTitle} numberOfLines={1}>{course.title}</Text>
                  <View style={styles.courseRowMeta}>
                    <ProgressBar progress={course.percentComplete} height={4} />
                    <Text style={styles.courseRowPercent}>{Math.round(course.percentComplete)}%</Text>
                  </View>
                </View>
                <Text style={styles.recentArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completed Courses */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Completed</Text>
            {completed.map((course: DashboardCourse) => (
              <TouchableOpacity
                key={course.courseId}
                style={[styles.courseRow, shadows.subtle]}
                onPress={() => router.push(`/catalog/${course.slug}`)}
                accessibilityLabel={`${course.title}, completed`}
              >
                <View style={styles.courseRowInfo}>
                  <Text style={styles.courseRowTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.courseRowDate}>
                    {course.completedAt
                      ? new Date(course.completedAt).toLocaleDateString()
                      : "Completed"}
                  </Text>
                </View>
                <Text style={styles.completedCheck}>✓</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {inProgress.length === 0 && completed.length === 0 && recentLessons.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎓</Text>
            <Text style={styles.emptyTitle}>Start Your Journey</Text>
            <Text style={styles.emptySubtitle}>
              Browse our courses and begin learning today
            </Text>
            <TouchableOpacity
              style={styles.browseCta}
              onPress={() => router.push("/catalog")}
              accessibilityLabel="Browse courses"
            >
              <Text style={styles.browseCtaText}>Browse Courses →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  greetingSection: { paddingTop: spacing.lg, marginBottom: spacing.lg },
  greeting: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },

  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.captionSm, color: colors.accent, marginBottom: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeAll: { ...typography.buttonSm, color: colors.primary },

  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },

  // Recent activity
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  recentInfo: { flex: 1 },
  recentTitle: { ...typography.bodyMedium, color: colors.text },
  recentCourse: { ...typography.bodySm, color: colors.textTertiary, marginTop: 2 },
  recentDone: { fontSize: 16, color: colors.success, fontWeight: "700" },
  recentArrow: { fontSize: 24, color: colors.textTertiary },

  // Course rows
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  courseRowInfo: { flex: 1 },
  courseRowTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  courseRowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  courseRowPercent: { ...typography.caption, color: colors.textSecondary, width: 36, textAlign: "right" },
  courseRowDate: { ...typography.bodySm, color: colors.textTertiary },
  completedCheck: { fontSize: 18, color: colors.success, fontWeight: "700", marginLeft: spacing.sm },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  browseCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  browseCtaText: { ...typography.button, color: colors.textInverse },
});
