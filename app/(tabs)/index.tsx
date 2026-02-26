import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useApiClient } from "../../src/services/apiClient";
import { SkeletonDashboard } from "../../src/components/SkeletonBox";
import { ProgressBar } from "../../src/components/ProgressBar";
import type { DashboardCourse, RecentLesson } from "../../src/services/types";

export default function HomeScreen() {
  const api = useApiClient();
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
  });

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections: { title: string; data: (DashboardCourse | RecentLesson)[] }[] = [];

  if (data?.inProgressCourses?.length) {
    sections.push({ title: "Continue Learning", data: data.inProgressCourses });
  }
  if (data?.recentLessons?.length) {
    sections.push({ title: "Recent Lessons", data: data.recentLessons });
  }

  const renderContinueCourse = (item: DashboardCourse) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.nextLesson) {
          router.push(`/lesson/${item.slug}/${item.nextLesson.slug}`);
        } else {
          router.push(`/(tabs)/catalog/${item.slug}`);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={`Continue ${item.title}`}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <ProgressBar percent={item.percentComplete} complete={item.percentComplete >= 100} />
      <Text style={styles.progressText}>
        {item.percentComplete >= 100 ? "✓ Complete" : `${Math.round(item.percentComplete)}% complete`}
      </Text>
      {item.nextLesson && (
        <Text style={styles.nextLesson}>Next: {item.nextLesson.title}</Text>
      )}
    </TouchableOpacity>
  );

  const renderRecentLesson = (item: RecentLesson) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/lesson/${item.courseSlug}/${item.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`Resume ${item.title}`}
    >
      <Text style={styles.cardSubtitle}>{item.courseTitle}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.completed && <Text style={styles.completedBadge}>✓ Completed</Text>}
    </TouchableOpacity>
  );

  if (!sections.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Welcome{data?.userName ? `, ${data.userName}` : ""}!</Text>
        <Text style={styles.emptySubtitle}>Browse the catalog to start learning</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/(tabs)/catalog")}
        >
          <Text style={styles.browseText}>Browse Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      data={sections}
      keyExtractor={(item) => item.title}
      renderItem={({ item: section }) => (
        <View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.data.map((item) => (
            <View key={"courseId" in item ? item.courseId : item.lessonId}>
              {"courseId" in item ? renderContinueCourse(item) : renderRecentLesson(item)}
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 12, marginTop: 8 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  cardSubtitle: { fontSize: 12, color: "#666", marginBottom: 4 },
  progressText: { fontSize: 12, color: "#666", marginTop: 6 },
  nextLesson: { fontSize: 13, color: "#2563eb", marginTop: 8 },
  completedBadge: { fontSize: 12, color: "#16a34a", marginTop: 8 },
  emptyTitle: { fontSize: 24, fontWeight: "700", color: "#1a1a1a" },
  emptySubtitle: { fontSize: 16, color: "#666", marginTop: 8, marginBottom: 24 },
  browseButton: { backgroundColor: "#2563eb", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  browseText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 12 },
  retryButton: { padding: 12 },
  retryText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
});
