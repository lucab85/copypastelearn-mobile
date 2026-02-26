import { useAuth } from "@clerk/clerk-expo";
import type {
  ApiResponse,
  CourseListItem,
  CourseDetail,
  LessonDetail,
  DashboardData,
  MuxTokensResponse,
} from "./types";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

async function apiFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options?: RequestInit
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `API error ${res.status}`);
  }

  return json.data as T;
}

/**
 * Hook that returns typed API methods with automatic Clerk token injection.
 */
export function useApiClient() {
  const { getToken } = useAuth();

  return {
    getCourses: () =>
      apiFetch<CourseListItem[]>("/api/mobile/courses", getToken),

    getCourse: (slug: string) =>
      apiFetch<CourseDetail>(`/api/mobile/courses/${slug}`, getToken),

    getLesson: (courseSlug: string, lessonSlug: string) =>
      apiFetch<LessonDetail>(
        `/api/mobile/courses/${courseSlug}/lessons/${lessonSlug}`,
        getToken
      ),

    getDashboard: () =>
      apiFetch<DashboardData>("/api/mobile/dashboard", getToken),

    saveVideoPosition: (lessonId: string, positionSeconds: number) =>
      apiFetch<{ success: boolean }>(
        "/api/mobile/progress/position",
        getToken,
        {
          method: "POST",
          body: JSON.stringify({ lessonId, positionSeconds }),
        }
      ),

    markLessonComplete: (lessonId: string) =>
      apiFetch<{ success: boolean; percentComplete?: number }>(
        "/api/mobile/progress/complete",
        getToken,
        {
          method: "POST",
          body: JSON.stringify({ lessonId }),
        }
      ),

    getMuxTokens: (playbackId: string) =>
      apiFetch<MuxTokensResponse>(
        `/api/mobile/mux/tokens/${playbackId}`,
        getToken
      ),
  };
}
