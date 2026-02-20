import type { Course, Enrollment, Lesson, Topic } from '@/types/lms'

const COURSES_KEY = 'lms_courses'
const TOPICS_KEY = 'lms_topics'
const LESSONS_KEY = 'lms_lessons'
const ENROLLMENTS_KEY = 'lms_enrollments'

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`
}

function getItems<T>(key: string): T[] {
  const store = storage()
  if (!store) return []
  try {
    const data = store.getItem(key)
    return data ? (JSON.parse(data) as T[]) : []
  } catch {
    return []
  }
}

function setItems<T>(key: string, items: T[]): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(items))
  } catch {
    // ignore localStorage write failures
  }
}

// Courses
export function getCourses(): Course[] {
  return getItems<Course>(COURSES_KEY)
}

export function getCourse(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id)
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug)
}

export function createCourse(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
  const course: Course = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const courses = getCourses()
  courses.push(course)
  setItems(COURSES_KEY, courses)
  return course
}

export function updateCourse(id: string, data: Partial<Course>): Course | undefined {
  const courses = getCourses()
  const index = courses.findIndex((c) => c.id === id)
  if (index === -1) return undefined
  courses[index] = { ...courses[index], ...data, updatedAt: new Date().toISOString() }
  setItems(COURSES_KEY, courses)
  return courses[index]
}

export function deleteCourse(id: string): void {
  setItems(
    COURSES_KEY,
    getCourses().filter((c) => c.id !== id)
  )
  // cascade delete topics and lessons
  const topics = getTopicsByCourse(id)
  topics.forEach((t) => deleteTopic(t.id))
}

// Topics
export function getTopics(): Topic[] {
  return getItems<Topic>(TOPICS_KEY)
}

export function getTopicsByCourse(courseId: string): Topic[] {
  return getTopics()
    .filter((t) => t.courseId === courseId)
    .sort((a, b) => a.order - b.order)
}

export function createTopic(data: Omit<Topic, 'id' | 'createdAt'>): Topic {
  const topic: Topic = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const topics = getTopics()
  topics.push(topic)
  setItems(TOPICS_KEY, topics)
  return topic
}

export function updateTopic(id: string, data: Partial<Topic>): void {
  const topics = getTopics()
  const index = topics.findIndex((t) => t.id === id)
  if (index === -1) return
  topics[index] = { ...topics[index], ...data }
  setItems(TOPICS_KEY, topics)
}

export function deleteTopic(id: string): void {
  setItems(
    TOPICS_KEY,
    getTopics().filter((t) => t.id !== id)
  )
  // cascade delete lessons
  setItems(
    LESSONS_KEY,
    getLessons().filter((l) => l.topicId !== id)
  )
}

export function reorderTopics(courseId: string, orderedIds: string[]): void {
  void courseId
  const topics = getTopics()
  orderedIds.forEach((id, index) => {
    const topic = topics.find((t) => t.id === id)
    if (topic) topic.order = index
  })
  setItems(TOPICS_KEY, topics)
}

// Lessons
export function getLessons(): Lesson[] {
  return getItems<Lesson>(LESSONS_KEY)
}

export function getLessonsByTopic(topicId: string): Lesson[] {
  return getLessons()
    .filter((l) => l.topicId === topicId)
    .sort((a, b) => a.order - b.order)
}

export function createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Lesson {
  const lesson: Lesson = {
    ...data,
    slug: data.slug || generateSlug(data.title),
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const lessons = getLessons()
  lessons.push(lesson)
  setItems(LESSONS_KEY, lessons)
  return lesson
}

export function getLessonBySlug(courseId: string, lessonSlug: string): Lesson | undefined {
  const topics = getTopicsByCourse(courseId)
  for (const topic of topics) {
    const lesson = getLessonsByTopic(topic.id).find((l) => l.slug === lessonSlug)
    if (lesson) return lesson
  }
  return undefined
}

export function updateLesson(id: string, data: Partial<Lesson>): void {
  const lessons = getLessons()
  const index = lessons.findIndex((l) => l.id === id)
  if (index === -1) return
  lessons[index] = { ...lessons[index], ...data, updatedAt: new Date().toISOString() }
  setItems(LESSONS_KEY, lessons)
}

export function deleteLesson(id: string): void {
  setItems(
    LESSONS_KEY,
    getLessons().filter((l) => l.id !== id)
  )
}

export function reorderLessons(topicId: string, orderedIds: string[]): void {
  const lessons = getLessons()
  orderedIds.forEach((id, index) => {
    const lesson = lessons.find((l) => l.id === id)
    if (lesson) lesson.order = index
  })
  setItems(LESSONS_KEY, lessons)
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

// Enrollments
export function getEnrollments(): Enrollment[] {
  return getItems<Enrollment>(ENROLLMENTS_KEY)
}

export function getEnrollment(courseId: string): Enrollment | undefined {
  return getEnrollments().find((e) => e.courseId === courseId)
}

export function enrollCourse(courseId: string): Enrollment {
  const existing = getEnrollment(courseId)
  if (existing) return existing
  const enrollment: Enrollment = {
    id: generateId(),
    courseId,
    enrolledAt: new Date().toISOString(),
    completedLessons: [],
    notes: {},
  }
  const enrollments = getEnrollments()
  enrollments.push(enrollment)
  setItems(ENROLLMENTS_KEY, enrollments)
  return enrollment
}

export function unenrollCourse(courseId: string): void {
  setItems(
    ENROLLMENTS_KEY,
    getEnrollments().filter((e) => e.courseId !== courseId)
  )
}

export function toggleLessonComplete(courseId: string, lessonId: string): boolean {
  const enrollments = getEnrollments()
  const enrollment = enrollments.find((e) => e.courseId === courseId)
  if (!enrollment) return false
  const idx = enrollment.completedLessons.indexOf(lessonId)
  if (idx === -1) {
    enrollment.completedLessons.push(lessonId)
  } else {
    enrollment.completedLessons.splice(idx, 1)
  }
  setItems(ENROLLMENTS_KEY, enrollments)
  return idx === -1
}

export function isLessonComplete(courseId: string, lessonId: string): boolean {
  const enrollment = getEnrollment(courseId)
  return enrollment ? enrollment.completedLessons.includes(lessonId) : false
}

export function getCourseProgress(courseId: string): number {
  const enrollment = getEnrollment(courseId)
  if (!enrollment) return 0
  const topics = getTopicsByCourse(courseId)
  const totalLessons = topics.reduce((sum, topic) => sum + getLessonsByTopic(topic.id).length, 0)
  if (totalLessons === 0) return 0
  return Math.round((enrollment.completedLessons.length / totalLessons) * 100)
}

export function saveNote(courseId: string, lessonId: string, note: string): void {
  const enrollments = getEnrollments()
  const enrollment = enrollments.find((e) => e.courseId === courseId)
  if (!enrollment) return
  enrollment.notes[lessonId] = note
  setItems(ENROLLMENTS_KEY, enrollments)
}

export function getNote(courseId: string, lessonId: string): string {
  const enrollment = getEnrollment(courseId)
  return enrollment?.notes[lessonId] || ''
}
