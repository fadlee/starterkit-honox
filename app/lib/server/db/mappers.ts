import type { InferSelectModel } from 'drizzle-orm'

import type { Course, Enrollment, Lesson, User } from '@/types/lms'
import {
  courses,
  enrollments,
  lessons,
  topics,
  users,
} from '@/lib/server/db/schema'

export type UserRow = InferSelectModel<typeof users>
export type CourseRow = InferSelectModel<typeof courses>
export type TopicRow = InferSelectModel<typeof topics>
export type LessonRow = InferSelectModel<typeof lessons>
export type EnrollmentRow = InferSelectModel<typeof enrollments>

function parseJsonStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function toPublicUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    role: row.role,
    createdAt: row.createdAt,
  }
}

export function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    difficultyLevel: row.difficultyLevel,
    visibility: row.visibility,
    featuredImage: row.featuredImage,
    pricingModel: row.pricingModel,
    categories: parseJsonStringArray(row.categoriesJson),
    tags: parseJsonStringArray(row.tagsJson),
    author: row.author,
    isScheduled: row.isScheduled,
    scheduleDate: row.scheduleDate ?? '',
    isPublicCourse: row.isPublicCourse,
    maxStudents: row.maxStudents,
    certificate: row.certificate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toTopic(row: TopicRow) {
  return {
    id: row.id,
    courseId: row.courseId,
    title: row.title,
    order: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    topicId: row.topicId,
    courseId: row.courseId,
    title: row.title,
    slug: row.slug,
    content: row.content,
    featuredImage: row.featuredImage,
    videoUrl: row.videoUrl,
    videoPlaybackHours: row.videoPlaybackHours,
    videoPlaybackMinutes: row.videoPlaybackMinutes,
    videoPlaybackSeconds: row.videoPlaybackSeconds,
    exerciseFiles: parseJsonStringArray(row.exerciseFilesJson),
    isPreview: row.isPreview,
    previewType: row.previewType,
    order: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toEnrollment(
  row: EnrollmentRow,
  completedLessons: string[],
  noteRows: Array<{ lessonId: string; note: string }>
): Enrollment {
  const notes: Record<string, string> = {}
  for (const noteRow of noteRows) {
    notes[noteRow.lessonId] = noteRow.note
  }

  return {
    id: row.id,
    userId: row.userId,
    courseId: row.courseId,
    enrolledAt: row.enrolledAt,
    completedLessons,
    notes,
  }
}

export function toJsonStringArray(values: string[]): string {
  return JSON.stringify(values.filter((item) => typeof item === 'string'))
}
