import type { Course, Enrollment, Lesson, Topic } from '@/types/lms'
import { apiFetch, ApiHttpError } from '@/lib/api-client'

function encode(value: string): string {
  return encodeURIComponent(value)
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiHttpError && error.status === 404
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiHttpError && error.status === 401
}

export async function getCourses(): Promise<Course[]> {
  try {
    return await apiFetch<Course[]>('/api/courses')
  } catch {
    return []
  }
}

export async function getCourse(id: string): Promise<Course | undefined> {
  try {
    return await apiFetch<Course>(`/api/courses/${encode(id)}`)
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  try {
    return await apiFetch<Course>(`/api/courses/slug/${encode(slug)}`)
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}

export async function createCourse(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
  return apiFetch<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course | undefined> {
  try {
    return await apiFetch<Course>(`/api/courses/${encode(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}

export async function deleteCourse(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/courses/${encode(id)}`, {
    method: 'DELETE',
  })
}

export async function getTopics(): Promise<Topic[]> {
  const courses = await getCourses()
  const groups = await Promise.all(courses.map((course) => getTopicsByCourse(course.id)))
  return groups.flat()
}

export async function getTopicsByCourse(courseId: string): Promise<Topic[]> {
  try {
    return await apiFetch<Topic[]>(`/api/courses/${encode(courseId)}/topics`)
  } catch (error) {
    if (isNotFound(error)) return []
    throw error
  }
}

export async function createTopic(data: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
  return apiFetch<Topic>(`/api/courses/${encode(data.courseId)}/topics`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTopic(id: string, data: Partial<Topic>): Promise<void> {
  await apiFetch<Topic>(`/api/topics/${encode(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteTopic(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/topics/${encode(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderTopics(courseId: string, orderedIds: string[]): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/courses/${encode(courseId)}/topics/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  })
}

export async function getLessons(): Promise<Lesson[]> {
  const topics = await getTopics()
  const groups = await Promise.all(topics.map((topic) => getLessonsByTopic(topic.id)))
  return groups.flat()
}

export async function getLessonsByTopic(topicId: string): Promise<Lesson[]> {
  try {
    return await apiFetch<Lesson[]>(`/api/topics/${encode(topicId)}/lessons`)
  } catch (error) {
    if (isNotFound(error)) return []
    throw error
  }
}

export async function createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
  return apiFetch<Lesson>(`/api/topics/${encode(data.topicId)}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getLessonBySlug(
  courseId: string,
  lessonSlug: string
): Promise<Lesson | undefined> {
  try {
    return await apiFetch<Lesson>(
      `/api/courses/${encode(courseId)}/lessons/slug/${encode(lessonSlug)}`
    )
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<void> {
  await apiFetch<Lesson>(`/api/lessons/${encode(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteLesson(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/lessons/${encode(id)}`, {
    method: 'DELETE',
  })
}

export async function reorderLessons(topicId: string, orderedIds: string[]): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/topics/${encode(topicId)}/lessons/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  })
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function getEnrollments(): Promise<Enrollment[]> {
  try {
    const courses = await getCourses()
    const maybe = await Promise.all(courses.map((course) => getEnrollment(course.id)))
    return maybe.filter((item): item is Enrollment => !!item)
  } catch {
    return []
  }
}

export async function getEnrollment(courseId: string): Promise<Enrollment | undefined> {
  try {
    const enrollment = await apiFetch<Enrollment | null>(`/api/courses/${encode(courseId)}/enrollment`)
    return enrollment ?? undefined
  } catch (error) {
    if (isUnauthorized(error) || isNotFound(error)) return undefined
    throw error
  }
}

export async function enrollCourse(courseId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/api/courses/${encode(courseId)}/enrollment`, {
    method: 'POST',
  })
}

export async function unenrollCourse(courseId: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/courses/${encode(courseId)}/enrollment`, {
    method: 'DELETE',
  })
}

export async function toggleLessonComplete(courseId: string, lessonId: string): Promise<boolean> {
  try {
    const response = await apiFetch<{ completed: boolean; progress: number }>(
      `/api/courses/${encode(courseId)}/lessons/${encode(lessonId)}/toggle-complete`,
      {
        method: 'POST',
      }
    )
    return response.completed
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 400) {
      return false
    }
    throw error
  }
}

export async function isLessonComplete(courseId: string, lessonId: string): Promise<boolean> {
  const enrollment = await getEnrollment(courseId)
  return enrollment ? enrollment.completedLessons.includes(lessonId) : false
}

export async function getCourseProgress(courseId: string): Promise<number> {
  try {
    const response = await apiFetch<{ progress: number }>(`/api/courses/${encode(courseId)}/progress`)
    return response.progress
  } catch (error) {
    if (isUnauthorized(error) || isNotFound(error)) return 0
    throw error
  }
}

export async function saveNote(courseId: string, lessonId: string, note: string): Promise<void> {
  await apiFetch<{ ok: boolean; note: string }>(
    `/api/courses/${encode(courseId)}/lessons/${encode(lessonId)}/note`,
    {
      method: 'PUT',
      body: JSON.stringify({ note }),
    }
  )
}

export async function getNote(courseId: string, lessonId: string): Promise<string> {
  try {
    const response = await apiFetch<{ note: string }>(
      `/api/courses/${encode(courseId)}/lessons/${encode(lessonId)}/note`
    )
    return response.note
  } catch (error) {
    if (isUnauthorized(error) || isNotFound(error)) return ''
    throw error
  }
}
