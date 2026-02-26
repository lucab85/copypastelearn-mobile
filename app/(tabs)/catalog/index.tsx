import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useApiClient } from "../../../src/services/apiClient";
import type { CourseListItem } from "../../../src/services/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "#16a34a",
  INTERMEDIATE: "#ca8a04",
  ADVANCED: "#dc2626",
};

export default function CatalogScreen() {
  const api = useApiClient();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: courses, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["courses"],
    queryFn: api.getCourses,
  });

  const filtered = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderCourse = ({ item }: { item: CourseListItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/catalog/${item.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.difficulty}, ${item.lessonCount} lessons`}
    >
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.difficulty,
            { color: DIFFICULTY_COLORS[item.difficulty] ?? "#666" },
          ]}
        >
          {item.difficulty}
        </Text>
        <Text style={styles.lessonCount}>{item.lessonCount} lessons</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>
      {item.userProgress && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.userProgress.percentComplete}%` },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load courses</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search courses"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courses found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchInput: {
    margin: 16, marginBottom: 0, backgroundColor: "#fff", borderRadius: 12,
    padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#e5e7eb",
  },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  difficulty: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  lessonCount: { fontSize: 12, color: "#666" },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  cardDesc: { fontSize: 14, color: "#666", lineHeight: 20 },
  progressBar: { height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, marginTop: 12 },
  progressFill: { height: 4, backgroundColor: "#2563eb", borderRadius: 2 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 32 },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 12 },
  retryButton: { padding: 12 },
  retryText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
});
