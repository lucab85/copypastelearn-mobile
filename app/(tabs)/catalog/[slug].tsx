import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useApiClient } from "../../../src/services/apiClient";
import { SkeletonBox, SkeletonLessonRow } from "../../../src/components/SkeletonBox";
import { ProgressBar } from "../../../src/components/ProgressBar";
import type { LessonSummary } from "../../../src/services/types";

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const api = useApiClient();
  const router = useRouter();

  const { data: course, isLoading, error, refetch } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => api.getCourse(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={styles.listContent}>
          <SkeletonBox width="70%" height={24} style={{ marginBottom: 12 }} />
          <SkeletonBox width="90%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBox width="80%" height={14} style={{ marginBottom: 20 }} />
          <SkeletonBox height={6} style={{ marginBottom: 20 }} />
          <SkeletonLessonRow />
          <SkeletonLessonRow />
          <SkeletonLessonRow />
          <SkeletonLessonRow />
          <SkeletonLessonRow />
        </View>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load course</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter out lessons that have labs (FR-9: labs hidden everywhere)
  const lessons = course.lessons.filter((l) => !l.hasLab);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const min = Math.floor(seconds / 60);
    return `${min} min`;
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
      accessibilityLabel={`Lesson ${index + 1}: ${item.title}${item.isAccessible ? "" : ", locked"}`}
    >
      <View style={styles.lessonRow}>
        <View style={styles.lessonIndex}>
          {item.userProgress?.completed ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={styles.indexText}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, !item.isAccessible && styles.lockedText]}>
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
            {!item.isAccessible && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: course.title }} />
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor="#2563eb"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.description}>{course.description}</Text>
            {course.userProgress && (
              <View style={styles.progressSection}>
                <ProgressBar
                  percent={course.userProgress.percentComplete}
                  complete={course.userProgress.percentComplete >= 100}
                />
                <Text style={styles.progressLabel}>
                  {course.userProgress.percentComplete >= 100
                    ? "✓ Complete"
                    : `${Math.round(course.userProgress.percentComplete)}% complete`}
                </Text>
              </View>
            )}
            {course.outcomes?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What you'll learn</Text>
                {course.outcomes.map((o, i) => (
                  <Text key={i} style={styles.outcomeItem}>
                    • {o}
                  </Text>
                ))}
              </View>
            )}
            <Text style={styles.lessonsHeader}>
              {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a", marginBottom: 8 },
  description: { fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 12 },
  progressSection: { marginBottom: 16, gap: 4 },
  progressLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginBottom: 8 },
  outcomeItem: { fontSize: 14, color: "#444", lineHeight: 22, marginLeft: 4 },
  lessonsHeader: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginTop: 8, marginBottom: 4 },
  lessonCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.03,
    shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  lockedCard: { opacity: 0.6 },
  lessonRow: { flexDirection: "row", alignItems: "center" },
  lessonIndex: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#f0f4ff",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  indexText: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
  checkmark: { fontSize: 16, color: "#16a34a", fontWeight: "700" },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: "500", color: "#1a1a1a" },
  lockedText: { color: "#999" },
  lessonMeta: { flexDirection: "row", marginTop: 4, gap: 8, alignItems: "center" },
  duration: { fontSize: 12, color: "#999" },
  freeBadge: { fontSize: 11, color: "#16a34a", fontWeight: "600" },
  lockIcon: { fontSize: 12 },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 12 },
  retryButton: { padding: 12 },
  retryText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
});
