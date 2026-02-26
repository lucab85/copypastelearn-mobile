import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  AppState,
  type AppStateStatus,
} from "react-native";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import { useApiClient } from "../../../src/services/apiClient";

const SAVE_INTERVAL_MS = 10_000; // save position every 10s

export default function LessonPlayerScreen() {
  const { courseSlug, lessonSlug } = useLocalSearchParams<{
    courseSlug: string;
    lessonSlug: string;
  }>();
  const api = useApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const videoRef = useRef<Video>(null);
  const lastSavedPositionRef = useRef(0);
  const currentPositionRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval>>();
  const hasCompletedRef = useRef(false);

  const { data: lesson, isLoading, error, refetch } = useQuery({
    queryKey: ["lesson", courseSlug, lessonSlug],
    queryFn: () => api.getLesson(courseSlug!, lessonSlug!),
    enabled: !!courseSlug && !!lessonSlug,
  });

  const { data: muxTokens } = useQuery({
    queryKey: ["mux-tokens", lesson?.videoPlaybackId],
    queryFn: () => api.getMuxTokens(lesson!.videoPlaybackId!),
    enabled: !!lesson?.videoPlaybackId,
  });

  // Save current position to backend
  const savePosition = useCallback(async () => {
    if (!lesson) return;
    const pos = currentPositionRef.current;
    if (Math.abs(pos - lastSavedPositionRef.current) < 2) return; // skip if <2s change
    lastSavedPositionRef.current = pos;
    try {
      await api.saveVideoPosition(lesson.id, pos);
    } catch {
      // Silently fail — will retry next interval
    }
  }, [lesson, api]);

  // Periodic save timer
  useEffect(() => {
    saveTimerRef.current = setInterval(savePosition, SAVE_INTERVAL_MS);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      // Save on unmount
      savePosition();
    };
  }, [savePosition]);

  // Save on app background
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === "background" || state === "inactive") {
        savePosition();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [savePosition]);

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    currentPositionRef.current = (status.positionMillis ?? 0) / 1000;

    // Mark complete when video finishes
    if (status.didJustFinish && !hasCompletedRef.current && lesson) {
      hasCompletedRef.current = true;
      try {
        await api.markLessonComplete(lesson.id);
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["course", courseSlug] });
      } catch {
        // Will sync next time
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load lesson</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build video URI
  let videoUri: string | null = null;
  if (lesson.videoPlaybackId) {
    if (muxTokens?.signed && muxTokens.playback) {
      videoUri = `https://stream.mux.com/${lesson.videoPlaybackId}.m3u8?token=${muxTokens.playback}`;
    } else {
      videoUri = `https://stream.mux.com/${lesson.videoPlaybackId}.m3u8`;
    }
  }

  const resumePosition = lesson.userProgress?.videoPositionSeconds ?? 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: lesson.title, headerBackTitle: "Back" }} />

      {videoUri ? (
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          positionMillis={resumePosition * 1000}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => console.warn("Video error:", error)}
        />
      ) : (
        <View style={styles.noVideo}>
          <Text style={styles.noVideoText}>No video available</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>

        {lesson.userProgress?.completed && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}

        {lesson.transcript && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transcript</Text>
            <Text style={styles.transcript}>{lesson.transcript}</Text>
          </View>
        )}

        {lesson.resources && lesson.resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            {lesson.resources.map((r, i) => (
              <Text key={i} style={styles.resourceLink}>
                • {r.title}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.navButtons}>
          {lesson.previousLesson && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                savePosition();
                router.replace(`/lesson/${courseSlug}/${lesson.previousLesson!.slug}`);
              }}
              accessibilityLabel={`Previous: ${lesson.previousLesson.title}`}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}
          {lesson.nextLesson && (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={() => {
                savePosition();
                router.replace(`/lesson/${courseSlug}/${lesson.nextLesson!.slug}`);
              }}
              accessibilityLabel={`Next: ${lesson.nextLesson.title}`}
            >
              <Text style={[styles.navButtonText, styles.navButtonPrimaryText]}>
                Next →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  noVideo: {
    width: "100%", aspectRatio: 16 / 9, backgroundColor: "#1a1a1a",
    justifyContent: "center", alignItems: "center",
  },
  noVideoText: { color: "#666", fontSize: 16 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 },
  completedBanner: {
    backgroundColor: "#f0fdf4", borderRadius: 8, padding: 10, marginBottom: 16,
  },
  completedText: { color: "#16a34a", fontWeight: "600", textAlign: "center" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginBottom: 8 },
  transcript: { fontSize: 14, color: "#444", lineHeight: 22 },
  resourceLink: { fontSize: 14, color: "#2563eb", marginBottom: 6 },
  navButtons: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 16, marginBottom: 32, gap: 12,
  },
  navButton: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: "#ddd", alignItems: "center",
  },
  navButtonPrimary: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  navButtonText: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  navButtonPrimaryText: { color: "#fff" },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 12 },
  retryButton: { padding: 12 },
  retryText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
});
