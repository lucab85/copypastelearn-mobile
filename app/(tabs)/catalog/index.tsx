import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useApiClient } from "../../../src/services/apiClient";
import { useDebouncedCallback } from "../../../src/hooks/useDebouncedCallback";
import { SkeletonCatalog } from "../../../src/components/SkeletonBox";
import { CourseCard } from "../../../src/components/CourseCard";
import { AnalyticsEvent, track } from "../../../src/services/analytics";
import { colors, typography, spacing, radii } from "../../../src/theme";
import { hapticSelection } from "../../../src/services/haptics";
import type { CourseListItem } from "../../../src/services/types";

type FilterType = "all" | "in_progress" | "completed" | "free";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "free", label: "Free" },
];

export default function CatalogScreen() {
  const api = useApiClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const debouncedUpdate = useDebouncedCallback((text: string) => {
    setDebouncedSearch(text);
  }, 300);

  useEffect(() => {
    track(AnalyticsEvent.CATALOG_VIEW);
  }, []);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["courses"],
    queryFn: ({ pageParam }) => api.getCoursesPaginated(pageParam as string | undefined),
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

  const allCourses = useMemo(
    () => data?.pages.flatMap((page: any) => page.data) ?? [],
    [data]
  );

  const filteredCourses = useMemo(() => {
    let result = allCourses;

    // Apply filter
    if (activeFilter === "in_progress") {
      result = result.filter((c: CourseListItem) => c.progress && c.progress > 0 && c.progress < 100);
    } else if (activeFilter === "completed") {
      result = result.filter((c: CourseListItem) => c.progress === 100);
    } else if (activeFilter === "free") {
      result = result.filter((c: CourseListItem) => c.isFree);
    }

    // Apply search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((c: CourseListItem) =>
        c.title.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allCourses, debouncedSearch, activeFilter]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    debouncedUpdate(text);
  };

  const renderCourseCard = useCallback(
    ({ item }: { item: CourseListItem }) => (
      <CourseCard
        title={item.title}
        slug={item.slug}
        lessonCount={item.lessonCount}
        imageUrl={item.imageUrl}
        category={item.category}
        progress={item.progress}
        isFree={item.isFree}
        onPress={() => {
          track(AnalyticsEvent.COURSE_VIEW, { courseSlug: item.slug });
          router.push(`/catalog/${item.slug}`);
        }}
      />
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={handleSearchChange}
            accessibilityLabel="Search courses"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => { setSearch(""); setDebouncedSearch(""); }}
              accessibilityLabel="Clear search"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
              onPress={() => { setActiveFilter(item.key); hapticSelection(); }}
              accessibilityLabel={`Filter: ${item.label}`}
              accessibilityState={{ selected: activeFilter === item.key }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Course List */}
      {isLoading ? (
        <SkeletonCatalog />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item: CourseListItem) => item.id}
          renderItem={renderCourseCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>
                {debouncedSearch ? "🔍" : "📚"}
              </Text>
              <Text style={styles.emptyTitle}>
                {debouncedSearch ? "No results" : "No courses yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {debouncedSearch
                  ? `Nothing matches "${debouncedSearch}"`
                  : "Check back soon!"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: { fontSize: 16, color: colors.textTertiary, padding: spacing.xs },

  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.buttonSm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },

  listContent: { padding: spacing.md },

  empty: { alignItems: "center", paddingTop: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary },
});
