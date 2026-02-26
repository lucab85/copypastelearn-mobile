import type {
  CourseListItem,
  CourseDetail,
  LessonDetail,
  DashboardData,
  ApiResponse,
} from "../types";

// Validate that types compile and match expected shapes
describe("API types", () => {
  it("CourseListItem has required fields", () => {
    const item: CourseListItem = {
      id: "1",
      title: "Test Course",
      slug: "test-course",
      description: "A test",
      difficulty: "BEGINNER",
      lessonCount: 5,
      thumbnailUrl: null,
    };
    expect(item.id).toBe("1");
    expect(item.difficulty).toBe("BEGINNER");
  });

  it("CourseDetail includes lessons array", () => {
    const detail: CourseDetail = {
      id: "1",
      title: "Test",
      slug: "test",
      description: "desc",
      outcomes: ["learn stuff"],
      prerequisites: [],
      difficulty: "INTERMEDIATE",
      estimatedDuration: 60,
      thumbnailUrl: null,
      lessons: [
        {
          id: "l1",
          title: "Lesson 1",
          slug: "lesson-1",
          sortOrder: 0,
          durationSeconds: 300,
          hasLab: false,
          isFree: true,
          isAccessible: true,
        },
      ],
    };
    expect(detail.lessons).toHaveLength(1);
    expect(detail.lessons[0].hasLab).toBe(false);
  });

  it("LessonDetail includes navigation", () => {
    const lesson: LessonDetail = {
      id: "l1",
      title: "Lesson 1",
      courseSlug: "test",
      videoPlaybackId: "abc123",
      transcript: "Hello world",
      codeSnippets: null,
      resources: null,
      labDefinitionId: null,
      userProgress: null,
      nextLesson: { slug: "lesson-2", title: "Lesson 2" },
      previousLesson: null,
    };
    expect(lesson.nextLesson?.slug).toBe("lesson-2");
    expect(lesson.labDefinitionId).toBeNull(); // no labs on mobile
  });

  it("DashboardData excludes lab sessions", () => {
    const dashboard: DashboardData = {
      userName: "Test User",
      totalLessonsCompleted: 3,
      inProgressCourses: [],
      completedCourses: [],
      recentLessons: [],
      activeLabSession: null, // always null on mobile
    };
    expect(dashboard.activeLabSession).toBeNull();
  });

  it("ApiResponse wraps data correctly", () => {
    const success: ApiResponse<string> = { success: true, data: "ok" };
    const failure: ApiResponse<string> = {
      success: false,
      error: { code: "NOT_FOUND", message: "Not found" },
    };
    expect(success.success).toBe(true);
    expect(failure.error?.code).toBe("NOT_FOUND");
  });
});
