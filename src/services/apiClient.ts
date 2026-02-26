import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import type {
  ApiResponse,
  CourseListItem,
  CourseDetail,
  LessonDetail,
  DashboardData,
  MuxTokensResponse,
  UserProfile,
  PaginatedResponse,
} from "./types";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 15_000;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  onUnauthorized?: () => void,
  options?: RequestInit
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Request timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 0, "TIMEOUT");
    }
    throw new ApiError("Network error", 0, "NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401/403 — trigger sign-out / auth redirect
  if (res.status === 401 || res.status === 403) {
    onUnauthorized?.();
    throw new ApiError(
      res.status === 401 ? "Authentication required" : "Access denied",
      res.status,
      res.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN"
    );
  }

  // Guard against non-JSON responses (proxy errors, HTML error pages)
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new ApiError(
      `Unexpected response (${res.status}): ${text.slice(0, 200)}`,
      res.status,
      "INVALID_RESPONSE"
    );
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.message ?? `API error ${res.status}`,
      res.status,
      json.error?.code
    );
  }

  return json.data as T;
}

/**
 * Hook that returns typed API methods with automatic Clerk token injection.
 * On 401/403, navigates to sign-in screen.
 */
export function useApiClient() {
  const { getToken, signOut } = useAuth();
  const router = useRouter();

  const onUnauthorized = () => {
    signOut().then(() => router.replace("/(auth)/sign-in")).catch(() => {});
  };

  const get = <T>(path: string) => apiFetch<T>(path, getToken, onUnauthorized);
  const post = <T>(path: string, body: unknown) =>
    apiFetch<T>(path, getToken, onUnauthorized, {
      method: "POST",
      body: JSON.stringify(body),
    });

  return {
    getCourses: () => get<CourseListItem[]>("/api/mobile/courses"),

    getCourse: (slug: string) =>
      get<CourseDetail>(`/api/mobile/courses/${slug}`),

    getLesson: (courseSlug: string, lessonSlug: string) =>
      get<LessonDetail>(
        `/api/mobile/courses/${courseSlug}/lessons/${lessonSlug}`
      ),

    getDashboard: () => get<DashboardData>("/api/mobile/dashboard"),

    getMe: () => get<UserProfile>("/api/mobile/me"),

    saveVideoPosition: (lessonId: string, positionSeconds: number) =>
      post<{ success: boolean }>("/api/mobile/progress/position", {
        lessonId,
        positionSeconds,
      }),

    markLessonComplete: (lessonId: string) =>
      post<{ success: boolean; percentComplete?: number }>(
        "/api/mobile/progress/complete",
        { lessonId }
      ),

    getMuxTokens: (playbackId: string) =>
      get<MuxTokensResponse>(`/api/mobile/mux/tokens/${playbackId}`),

    getCoursesPaginated: (cursor?: string, limit = 20) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (cursor) params.set("cursor", cursor);
      return apiFetch<{ data: CourseListItem[]; nextCursor: string | null }>(
        `/api/mobile/courses?${params}`,
        getToken,
        onUnauthorized
      ).then((res) => ({
        courses: (res as any).data ?? (res as any),
        nextCursor: (res as any).nextCursor ?? null,
      }));
    },
  };
}

export { ApiError };
