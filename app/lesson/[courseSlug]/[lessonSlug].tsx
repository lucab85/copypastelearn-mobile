import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useRef, useEffect, useCallback, useState } from "react";
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
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApiClient } from "../../../src/services/apiClient";
import { AnalyticsEvent, track } from "../../../src/services/analytics";

const SAVE_INTERVAL_MS = 10_000;
const BUFFERING_DEBOUNCE_MS = 500;
const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
  const isPlayingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setInterval>>();
  const hasCompletedRef = useRef(false);
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const tokenRetryRef = useRef(false);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [orientationSupported, setOrientationSupported] = useState(true);
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval>>();

  const { data: lesson, isLoading, error, refetch } = useQuery({
    queryKey: ["lesson", courseSlug, lessonSlug],
    queryFn: () => api.getLesson(courseSlug!, lessonSlug!),
    enabled: !!courseSlug && !!lessonSlug,
  });

  const {
    data: muxTokens,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: ["mux-tokens", lesson?.videoPlaybackId],
    queryFn: () => api.getMuxTokens(lesson!.videoPlaybackId!),
    enabled: !!lesson?.videoPlaybackId,
    staleTime: 1000 * 60 * 90,
  });

  // Check orientation support
  useEffect(() => {
    ScreenOrientation.getOrientationAsync().catch(() => {
      setOrientationSupported(false);
    });
  }, []);

  // Load autoplay setting
  useEffect(() => {
    AsyncStorage.getItem("settings:autoplay").then((val) => {
      if (val !== null) setAutoplayEnabled(val === "true");
    });
  }, []);

  // Track lesson view
  useEffect(() => {
    if (lesson) {
      track(AnalyticsEvent.LESSON_VIEW, { courseSlug, lessonSlug, lessonId: lesson.id });
    }
  }, [lesson, courseSlug, lessonSlug]);

  // Unlock orientation on unmount
  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
      deactivateKeepAwake();
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (lesson?.userProgress?.videoPositionSeconds && lesson.userProgress.videoPositionSeconds > 10) {
      setResumePosition(lesson.userProgress.videoPositionSeconds);
      setShowResumePrompt(true);
      track(AnalyticsEvent.RESUME_PROMPT_SHOWN, { lessonId: lesson.id });
    }
  }, [lesson]);

  const savePosition = useCallback(async () => {
    if (!lesson) return;
    if (!isPlayingRef.current) return;
    const pos = currentPositionRef.current;
    if (Math.abs(pos - lastSavedPositionRef.current) < 2) return;
    lastSavedPositionRef.current = pos;
    try {
      await api.saveVideoPosition(lesson.id, pos);
    } catch {
      // Will retry next interval
    }
  }, [lesson, api]);

  useEffect(() => {
    saveTimerRef.current = setInterval(savePosition, SAVE_INTERVAL_MS);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      savePosition();
    };
  }, [savePosition]);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === "background" || state === "inactive") {
        savePosition();
        deactivateKeepAwake();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [savePosition]);

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        // Auto-retry token refresh once
        if (!tokenRetryRef.current) {
          tokenRetryRef.current = true;
          refetchTokens();
          return;
        }
        setVideoError(status.error);
      }
      return;
    }

    // Reset token retry on successful load
    tokenRetryRef.current = false;
    setVideoError(null);

    currentPositionRef.current = (status.positionMillis ?? 0) / 1000;
    isPlayingRef.current = status.isPlaying;

    // Buffering indicator with debounce
    if (status.isBuffering && status.isPlaying) {
      if (!bufferingTimerRef.current) {
        bufferingTimerRef.current = setTimeout(() => {
          setIsBuffering(true);
        }, BUFFERING_DEBOUNCE_MS);
      }
    } else {
      if (bufferingTimerRef.current) {
        clearTimeout(bufferingTimerRef.current);
        bufferingTimerRef.current = undefined;
      }
      setIsBuffering(false);
    }

    if (status.isPlaying) {
      activateKeepAwakeAsync().catch(() => {});
    } else {
      deactivateKeepAwake();
      savePosition();
    }

    // Completion
    if (status.didJustFinish && !hasCompletedRef.current && lesson) {
      hasCompletedRef.current = true;
      deactivateKeepAwake();
      setShowCompletion(true);
      track(AnalyticsEvent.LESSON_COMPLETE, { lessonId: lesson.id, courseSlug });

      // Start autoplay countdown if enabled and next lesson exists
      if (autoplayEnabled && lesson.nextLesson) {
        setAutoplayCountdown(5);
        autoplayTimerRef.current = setInterval(() => {
          setAutoplayCountdown((prev) => {
            if (prev === null || prev <= 1) {
              if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
              // Navigate to next lesson
              ScreenOrientation.unlockAsync().catch(() => {});
              router.replace(`/lesson/${courseSlug}/${lesson.nextLesson!.slug}`);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }

      try {
        await api.markLessonComplete(lesson.id);
        track(AnalyticsEvent.PROGRESS_SAVE_SUCCESS, { lessonId: lesson.id });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["course", courseSlug] });
      } catch {
        track(AnalyticsEvent.PROGRESS_SAVE_FAIL, { lessonId: lesson.id });
      }
    }
  };

  const handleResume = () => {
    setShowResumePrompt(false);
    videoRef.current?.setPositionAsync(resumePosition * 1000);
  };

  const handleStartOver = () => {
    setShowResumePrompt(false);
    track(AnalyticsEvent.RESUME_START_OVER, { lessonId: lesson?.id });
    videoRef.current?.setPositionAsync(0);
  };

  const cyclePlaybackRate = () => {
    const currentIdx = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIdx + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(nextRate);
    videoRef.current?.setRateAsync(nextRate, true);
  };

  const toggleOrientation = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch {
      setOrientationSupported(false);
    }
  };

  const handleRetryVideo = () => {
    setVideoError(null);
    tokenRetryRef.current = false;
    refetchTokens();
  };

  const handleWatchAgain = () => {
    setShowCompletion(false);
    setAutoplayCountdown(null);
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    hasCompletedRef.current = false;
    videoRef.current?.setPositionAsync(0);
    videoRef.current?.playAsync();
  };

  const handleNextLesson = () => {
    if (lesson?.nextLesson) {
      savePosition();
      ScreenOrientation.unlockAsync().catch(() => {});
      router.replace(`/lesson/${courseSlug}/${lesson.nextLesson.slug}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load lesson</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let videoUri: string | null = null;
  if (lesson.videoPlaybackId) {
    if (muxTokens?.signed && muxTokens.playback) {
      videoUri = `https://stream.mux.com/${lesson.videoPlaybackId}.m3u8?token=${muxTokens.playback}`;
    } else {
      videoUri = `https://stream.mux.com/${lesson.videoPlaybackId}.m3u8`;
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: lesson.title, headerBackTitle: "Back" }} />

      {videoUri ? (
        <View>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={[styles.video, isLandscape && styles.videoLandscape]}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={!showResumePrompt && !showCompletion}
            rate={playbackRate}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={() => {
              if (!tokenRetryRef.current) {
                tokenRetryRef.current = true;
                refetchTokens();
              } else {
                setVideoError("Video playback failed");
              }
            }}
          />

          {/* Buffering overlay */}
          {isBuffering && !videoError && !showResumePrompt && !showCompletion && (
            <View style={styles.bufferingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {/* Video error overlay */}
          {videoError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorOverlayIcon}>⚠️</Text>
              <Text style={styles.errorOverlayText}>Video failed to load</Text>
              <TouchableOpacity style={styles.retryVideoButton} onPress={handleRetryVideo}>
                <Text style={styles.retryVideoText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Resume prompt overlay */}
          {showResumePrompt && (
            <View style={styles.resumeOverlay}>
              <Text style={styles.resumeText}>
                Resume from {formatTime(resumePosition)}?
              </Text>
              <View style={styles.resumeButtons}>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={handleStartOver}
                  accessibilityLabel="Start over"
                >
                  <Text style={styles.resumeButtonText}>Start Over</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resumeButton, styles.resumeButtonPrimary]}
                  onPress={handleResume}
                  accessibilityLabel={`Resume from ${formatTime(resumePosition)}`}
                >
                  <Text style={[styles.resumeButtonText, styles.whiteText]}>Resume</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Completion overlay */}
          {showCompletion && (
            <View style={styles.completionOverlay}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={styles.completionTitle}>Lesson Complete!</Text>
              <Text style={styles.completionCheck}>✓</Text>
              {autoplayCountdown !== null && lesson.nextLesson && (
                <Text style={styles.countdownText}>
                  Next lesson in {autoplayCountdown}s...
                </Text>
              )}
              <View style={styles.completionButtons}>
                <TouchableOpacity style={styles.completionBtn} onPress={handleWatchAgain}>
                  <Text style={styles.completionBtnText}>Watch Again</Text>
                </TouchableOpacity>
                {autoplayCountdown !== null && (
                  <TouchableOpacity
                    style={styles.completionBtn}
                    onPress={() => {
                      setAutoplayCountdown(null);
                      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
                    }}
                  >
                    <Text style={styles.completionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                {lesson.nextLesson && (
                  <TouchableOpacity
                    style={[styles.completionBtn, styles.completionBtnPrimary]}
                    onPress={handleNextLesson}
                  >
                    <Text style={[styles.completionBtnText, styles.whiteText]}>
                      Next: {lesson.nextLesson.title}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Controls bar */}
          <View style={styles.controlsBar}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={cyclePlaybackRate}
              accessibilityLabel={`Playback speed ${playbackRate}x`}
            >
              <Text style={styles.controlText}>{playbackRate}x</Text>
            </TouchableOpacity>

            {orientationSupported && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleOrientation}
                accessibilityLabel={isLandscape ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <Text style={styles.controlText}>{isLandscape ? "↙️" : "↗️"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noVideo}>
          <Text style={styles.noVideoText}>No video available</Text>
        </View>
      )}

      {!isLandscape && (
        <ScrollView style={styles.content}>
          <Text style={styles.title}>{lesson.title}</Text>

          {lesson.userProgress?.completed && !showCompletion && (
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
                <Text key={i} style={styles.resourceLink}>• {r.title}</Text>
              ))}
            </View>
          )}

          <View style={styles.navButtons}>
            {lesson.previousLesson && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => {
                  savePosition();
                  ScreenOrientation.unlockAsync().catch(() => {});
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
                  ScreenOrientation.unlockAsync().catch(() => {});
                  router.replace(`/lesson/${courseSlug}/${lesson.nextLesson!.slug}`);
                }}
                accessibilityLabel={`Next: ${lesson.nextLesson.title}`}
              >
                <Text style={[styles.navButtonText, styles.whiteText]}>Next →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6b7280" },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  videoLandscape: { aspectRatio: undefined, flex: 1, width: "100%", height: "100%" },
  noVideo: {
    width: "100%", aspectRatio: 16 / 9, backgroundColor: "#1a1a1a",
    justifyContent: "center", alignItems: "center",
  },
  noVideoText: { color: "#666", fontSize: 16 },

  // Buffering
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject, aspectRatio: 16 / 9,
    backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },

  // Error
  errorOverlay: {
    ...StyleSheet.absoluteFillObject, aspectRatio: 16 / 9,
    backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center",
  },
  errorOverlayIcon: { fontSize: 40, marginBottom: 12 },
  errorOverlayText: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 16 },
  retryVideoButton: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: "#2563eb",
  },
  retryVideoText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Resume
  resumeOverlay: {
    ...StyleSheet.absoluteFillObject, aspectRatio: 16 / 9,
    backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center",
  },
  resumeText: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 16 },
  resumeButtons: { flexDirection: "row", gap: 12 },
  resumeButton: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: "#fff",
  },
  resumeButtonPrimary: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  resumeButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Completion
  completionOverlay: {
    ...StyleSheet.absoluteFillObject, aspectRatio: 16 / 9,
    backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center",
  },
  completionEmoji: { fontSize: 48, marginBottom: 8 },
  completionTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  completionCheck: { color: "#16a34a", fontSize: 36, fontWeight: "700", marginBottom: 8 },
  countdownText: { color: "#93c5fd", fontSize: 14, fontWeight: "600", marginBottom: 16 },
  completionButtons: { gap: 10, alignItems: "center", width: "80%" },
  completionBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "#fff", width: "100%", alignItems: "center",
  },
  completionBtnPrimary: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  completionBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Controls bar
  controlsBar: {
    flexDirection: "row", justifyContent: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#111",
  },
  controlButton: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  controlText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  whiteText: { color: "#fff" },

  // Content
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
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 12 },
  retryButton: { padding: 12 },
  retryText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
});
