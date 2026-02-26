// Types mirrored from @copypastelearn/shared for mobile use

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  lessonCount: number;
  thumbnailUrl: string | null;
  userProgress?: { percentComplete: number } | null;
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  difficulty: Difficulty;
  estimatedDuration: number | null;
  thumbnailUrl: string | null;
  lessons: LessonSummary[];
  userProgress?: CourseProgressInfo | null;
}

export interface CourseProgressInfo {
  percentComplete: number;
  startedAt: string;
  completedAt: string | null;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  durationSeconds: number | null;
  hasLab: boolean;
  isFree: boolean;
  isAccessible: boolean;
  userProgress?: {
    completed: boolean;
    videoPositionSeconds: number;
  } | null;
}

export interface LessonDetail {
  id: string;
  title: string;
  courseSlug: string;
  videoPlaybackId: string | null;
  transcript: string | null;
  codeSnippets: CodeSnippet[] | null;
  resources: Resource[] | null;
  labDefinitionId: string | null;
  userProgress: LessonProgressInfo | null;
  nextLesson: LessonNav | null;
  previousLesson: LessonNav | null;
}

export interface CodeSnippet {
  label: string;
  language: string;
  code: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface LessonNav {
  slug: string;
  title: string;
}

export interface LessonProgressInfo {
  videoPositionSeconds: number;
  completed: boolean;
  lastAccessedAt: string;
}

export interface DashboardCourse {
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  percentComplete: number;
  completedAt: string | null;
  nextLesson: { slug: string; title: string } | null;
}

export interface RecentLesson {
  lessonId: string;
  title: string;
  slug: string;
  courseTitle: string;
  courseSlug: string;
  lastAccessedAt: string;
  completed: boolean;
}

export interface DashboardData {
  userName: string | null;
  totalLessonsCompleted: number;
  inProgressCourses: DashboardCourse[];
  completedCourses: DashboardCourse[];
  recentLessons: RecentLesson[];
  activeLabSession: null; // Labs hidden on mobile
}

export interface MuxTokensResponse {
  signed: boolean;
  playbackId: string;
  playback?: string;
  thumbnail?: string;
  storyboard?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
