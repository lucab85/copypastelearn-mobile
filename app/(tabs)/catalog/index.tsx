import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useApiClient } from "../../../src/services/apiClient";
import { useDebouncedCallback } from "../../../src/hooks/useDebouncedCallback";
import { SkeletonCourseCard } from "../../../src/components/SkeletonBox";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { AnalyticsEvent, track } from "../../../src/services/analytics";
import type { CourseListItem } from "../../../src/services/types";

const PAGE_SIZE = 20;

export default function CatalogScreen() {
  const api = useApiClient();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedUpdate = useDebouncedCallback((text: string) => {
    setDebouncedSearch(text);
  }, 300);

  // Track catalog view
  useEffect(() => {
    track(AnalyticsEvent.CATALOG_VIEW);
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    debouncedUpdate(text);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["courses"],
    queryFn: ({ pageParam }) =>
      api.getCoursesPaginated(pageParam ?? undefined, PAGE_SIZE),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allCourses = useMemo(
    () => data?.pages.flatMap((p) => p.courses) ?? [],
    [data]
  );

  const filteredCourses = useMemo(() => {
    if (!debouncedSearch.trim()) return allCourses;
    const q = debouncedSearch.toLowerCase();
    return allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [allCourses, debouncedSearch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !debouncedSearch.trim()) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearSearch = () => {
    setSearchText("");
    setDebouncedSearch("");
  };

  const renderCourseCard = ({ item }: { item: CourseListItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/catalog/${item.slug}`)}
      accessibilityLabel={`${item.title}, ${item.difficulty}, ${item.lessonCount} lessons`}
      accessibilityRole="button"
    >
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta}>
          {item.difficulty} · {item.lessonCount} lessons
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
        {item.userProgress && item.userProgress.percentComplete > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar
              percent={item.userProgress.percentComplete}
              complete={item.userProgress.percentComplete >= 100}
            />
            <Text style={styles.progressText}>
              {item.userProgress.percentComplete >= 100
                ? "✓ Complete"
                : `${Math.round(item.userProgress.percentComplete)}%`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No courses found</Text>
        <Text style={styles.emptySubtitle}>
          Try a different search term
        </Text>
        {debouncedSearch.trim() && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchText}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search courses"
          accessibilityHint="Type to filter courses by title"
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonCourseCard />
          <SkeletonCourseCard />
          <SkeletonCourseCard />
          <SkeletonCourseCard />
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseCard}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  skeletonContainer: { padding: 16 },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  thumbnail: { width: "100%", height: 140 },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  cardMeta: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  cardDesc: { fontSize: 14, color: "#444", marginTop: 6, lineHeight: 20 },
  progressContainer: { marginTop: 10, gap: 4 },
  progressText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  footerLoader: { paddingVertical: 20 },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  emptySubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  clearButtonText: { color: "#fff", fontWeight: "600" },
});
