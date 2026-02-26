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
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApiClient } from "../../../src/services/apiClient";
import { SkeletonDashboard } from "../../../src/components/SkeletonBox";
import { HeroCard } from "../../../src/components/HeroCard";
import { CourseCard } from "../../../src/components/CourseCard";
import { AnalyticsEvent, track } from "../../../src/services/analytics";
import { colors, typography, spacing, radii, shadows, getGreeting } from "../../../src/theme";

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
      <View style={styles.container}>
        <SkeletonDashboard />
      </View>
    );
  }

  const firstName = user?.firstName ?? "there";
  const coursesInProgress = data?.coursesInProgress ?? [];
  const completedCourses = data?.completedCourses ?? [];
  const continueLesson = data?.continueLesson;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
        <Text style={styles.subtitle}>
          {coursesInProgress.length > 0
            ? `${coursesInProgress.length} course${coursesInProgress.length > 1 ? "s" : ""} in progress`
            : "Ready to start learning?"}
        </Text>
      </View>

      {/* Continue Learning Hero */}
      {continueLesson && (
        <View style={styles.section}>
          <HeroCard
            courseTitle={continueLesson.courseTitle}
            lessonTitle={continueLesson.lessonTitle}
            courseSlug={continueLesson.courseSlug}
            lessonSlug={continueLesson.lessonSlug}
            imageUrl={continueLesson.imageUrl}
            progress={continueLesson.progress ?? 0}
            onPress={() => router.push(`/lesson/${continueLesson.courseSlug}/${continueLesson.lessonSlug}`)}
          />
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, shadows.subtle]}>
          <Text style={styles.statNumber}>{coursesInProgress.length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={[styles.statCard, shadows.subtle]}>
          <Text style={styles.statNumber}>{completedCourses.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, shadows.subtle]}>
          <Text style={styles.statNumber}>
            {coursesInProgress.length + completedCourses.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* In Progress Section */}
      {coursesInProgress.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <TouchableOpacity onPress={() => router.push("/catalog")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {coursesInProgress.map((course: any) => (
            <CourseCard
              key={course.id}
              title={course.title}
              slug={course.slug}
              lessonCount={course.lessonCount}
              imageUrl={course.imageUrl}
              progress={course.progress}
              onPress={() => router.push(`/catalog/${course.slug}`)}
            />
          ))}
        </View>
      )}

      {/* Completed Section */}
      {completedCourses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Completed</Text>
          {completedCourses.map((course: any) => (
            <CourseCard
              key={course.id}
              title={course.title}
              slug={course.slug}
              lessonCount={course.lessonCount}
              imageUrl={course.imageUrl}
              progress={100}
              onPress={() => router.push(`/catalog/${course.slug}`)}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {coursesInProgress.length === 0 && completedCourses.length === 0 && !continueLesson && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptySubtitle}>Browse courses and start learning today</Text>
          <TouchableOpacity
            style={styles.browseCta}
            onPress={() => router.push("/catalog")}
            accessibilityLabel="Browse courses"
          >
            <Text style={styles.browseCtaText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  greetingSection: { paddingTop: spacing.lg, marginBottom: spacing.lg },
  greeting: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },

  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
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

  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg },
  browseCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  browseCtaText: { ...typography.button, color: colors.textInverse },
});
