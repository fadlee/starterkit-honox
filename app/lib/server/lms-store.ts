import type { Course, Enrollment, Lesson, StoredUser, Topic, User, UserRole } from '@/types/lms'
import { hashPassword, verifyPassword } from '@/lib/server/db/password'
import {
  cleanupExpiredSessions,
  createSession as createSessionRecord,
  createUserRecord,
  deleteCourse as deleteCourseRecord,
  deleteLesson as deleteLessonRecord,
  deleteLessonsByTopic as deleteLessonsByTopicRecord,
  deleteSession as deleteSessionRecord,
  deleteTopic as deleteTopicRecord,
  deleteUser as deleteUserRecord,
  enrollCourse as enrollCourseRecord,
  findCourseBySlugExcludingId,
  findLessonByCourseSlugExcludingId,
  findUserAuthByNormalizedUsername,
  getCourseById as getCourseByIdRecord,
  getCourseBySlug as getCourseBySlugRecord,
  getCourseProgress as getCourseProgressRecord,
  getEnrollment as getEnrollmentRecord,
  getLessonById as getLessonByIdRecord,
  getLessonBySlug as getLessonBySlugRecord,
  getNote as getNoteRecord,
  getSessionUser as getSessionUserRecord,
  getTopicById as getTopicByIdRecord,
  getUserById as getUserByIdRecord,
  insertCourse,
  insertLesson,
  insertTopic,
  listCourses as listCoursesRecord,
  listLessonsByTopic as listLessonsByTopicRecord,
  listTopicsByCourse as listTopicsByCourseRecord,
  listUsers as listUsersRecord,
  reorderLessons as reorderLessonsRecord,
  reorderTopics as reorderTopicsRecord,
  saveNote as saveNoteRecord,
  toggleLessonComplete as toggleLessonCompleteRecord,
  unenrollCourse as unenrollCourseRecord,
  updateCourse as updateCourseRecord,
  updateLesson as updateLessonRecord,
  updateTopic as updateTopicRecord,
  updateUserPassword as updateUserPasswordRecord,
  updateUserRole as updateUserRoleRecord,
  bulkImportTopicsAndLessons as bulkImportRecord,
  type BulkImportTopic,
  type BulkImportResult,
} from '@/lib/server/db/repositories/lms-repo'

type CourseInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
type TopicInput = Omit<Topic, 'id' | 'createdAt'>
type LessonInput = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

function normalizeSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function ensureUniqueCourseSlug(
  database: D1Database,
  slug: string,
  excludeCourseId?: string
): Promise<string> {
  const base = normalizeSlug(slug) || 'course'
  let candidate = base
  let count = 2

  while (await findCourseBySlugExcludingId(database, candidate, excludeCourseId)) {
    candidate = `${base}-${count}`
    count += 1
  }

  return candidate
}

async function ensureUniqueLessonSlug(
  database: D1Database,
  courseId: string,
  slug: string,
  excludeLessonId?: string
): Promise<string> {
  const base = normalizeSlug(slug) || 'lesson'
  let candidate = base
  let count = 2

  while (await findLessonByCourseSlugExcludingId(database, courseId, candidate, excludeLessonId)) {
    candidate = `${base}-${count}`
    count += 1
  }

  return candidate
}

export async function listUsers(database: D1Database): Promise<User[]> {
  return listUsersRecord(database)
}

export async function getUserById(database: D1Database, id: string): Promise<User | null> {
  return getUserByIdRecord(database, id)
}

export async function getStoredUserByUsername(
  database: D1Database,
  username: string
): Promise<StoredUser | null> {
  const user = await findUserAuthByNormalizedUsername(database, normalizeUsername(username))
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
    password: user.passwordHash,
  }
}

export async function createUser(
  database: D1Database,
  data: { username: string; password: string; displayName: string }
): Promise<User | null> {
  const normalizedUsername = data.username.trim()
  if (!normalizedUsername) return null

  const existing = await findUserAuthByNormalizedUsername(
    database,
    normalizeUsername(normalizedUsername)
  )
  if (existing) return null

  const passwordHash = await hashPassword(data.password)
  return createUserRecord(database, {
    username: normalizedUsername,
    displayName: data.displayName.trim(),
    passwordHash,
    role: 'user',
  })
}

export async function authenticateUser(
  database: D1Database,
  username: string,
  password: string
): Promise<User | null> {
  const authUser = await findUserAuthByNormalizedUsername(database, normalizeUsername(username))
  if (!authUser) return null

  const ok = await verifyPassword(password, authUser.passwordHash)
  if (!ok) return null

  return {
    id: authUser.id,
    username: authUser.username,
    displayName: authUser.displayName,
    role: authUser.role,
    createdAt: authUser.createdAt,
  }
}

export async function updateUserRole(
  database: D1Database,
  userId: string,
  role: UserRole
): Promise<User | null> {
  return updateUserRoleRecord(database, userId, role)
}

export async function deleteUser(database: D1Database, userId: string): Promise<boolean> {
  return deleteUserRecord(database, userId)
}

export async function updateUserPassword(
  database: D1Database,
  userId: string,
  newPassword: string
): Promise<boolean> {
  const passwordHash = await hashPassword(newPassword)
  return updateUserPasswordRecord(database, userId, passwordHash)
}

export async function createSession(database: D1Database, userId: string): Promise<string> {
  const now = Date.now()
  await cleanupExpiredSessions(database, now)
  return createSessionRecord(database, userId, now + SESSION_TTL_MS)
}

export async function getSessionUser(
  database: D1Database,
  sessionId: string | undefined
): Promise<User | null> {
  if (!sessionId) return null
  await cleanupExpiredSessions(database)
  return getSessionUserRecord(database, sessionId)
}

export async function deleteSession(
  database: D1Database,
  sessionId: string | undefined
): Promise<void> {
  if (!sessionId) return
  await deleteSessionRecord(database, sessionId)
}

export async function listCourses(database: D1Database): Promise<Course[]> {
  return listCoursesRecord(database)
}

export async function getCourseById(
  database: D1Database,
  courseId: string
): Promise<Course | null> {
  return getCourseByIdRecord(database, courseId)
}

export async function getCourseBySlug(
  database: D1Database,
  slug: string
): Promise<Course | null> {
  return getCourseBySlugRecord(database, slug)
}

export async function createCourse(
  database: D1Database,
  data: CourseInput
): Promise<Course> {
  const slug = await ensureUniqueCourseSlug(database, data.slug || data.title)
  return insertCourse(database, {
    ...data,
    slug,
  })
}

export async function updateCourse(
  database: D1Database,
  courseId: string,
  data: Partial<Course>
): Promise<Course | null> {
  const current = await getCourseByIdRecord(database, courseId)
  if (!current) return null

  const payload = { ...data }
  if (payload.slug !== undefined) {
    payload.slug = await ensureUniqueCourseSlug(database, payload.slug, courseId)
  }

  return updateCourseRecord(database, courseId, payload)
}

export async function deleteCourse(database: D1Database, courseId: string): Promise<boolean> {
  return deleteCourseRecord(database, courseId)
}

export async function listTopicsByCourse(
  database: D1Database,
  courseId: string
): Promise<Topic[]> {
  return listTopicsByCourseRecord(database, courseId)
}

export async function createTopic(
  database: D1Database,
  data: TopicInput
): Promise<Topic> {
  return insertTopic(database, data)
}

export async function updateTopic(
  database: D1Database,
  topicId: string,
  data: Partial<Topic>
): Promise<Topic | null> {
  return updateTopicRecord(database, topicId, data)
}

export async function deleteTopic(database: D1Database, topicId: string): Promise<boolean> {
  return deleteTopicRecord(database, topicId)
}

export async function bulkImportTopicsAndLessons(
  database: D1Database,
  courseId: string,
  topics: BulkImportTopic[]
): Promise<BulkImportResult> {
  return bulkImportRecord(database, courseId, topics)
}

export type { BulkImportTopic, BulkImportResult }

export async function reorderTopics(
  database: D1Database,
  courseId: string,
  orderedIds: string[]
): Promise<boolean> {
  return reorderTopicsRecord(database, courseId, orderedIds)
}

export async function getTopicById(
  database: D1Database,
  topicId: string
): Promise<Topic | null> {
  return getTopicByIdRecord(database, topicId)
}

export async function listLessonsByTopic(
  database: D1Database,
  topicId: string
): Promise<Lesson[]> {
  return listLessonsByTopicRecord(database, topicId)
}

export async function createLesson(
  database: D1Database,
  data: LessonInput
): Promise<Lesson> {
  const slug = await ensureUniqueLessonSlug(database, data.courseId, data.slug || data.title)
  return insertLesson(database, {
    ...data,
    slug,
  })
}

export async function updateLesson(
  database: D1Database,
  lessonId: string,
  data: Partial<Lesson>
): Promise<Lesson | null> {
  const current = await getLessonByIdRecord(database, lessonId)
  if (!current) return null

  const payload = { ...data }
  if (payload.slug !== undefined) {
    payload.slug = await ensureUniqueLessonSlug(
      database,
      current.courseId,
      payload.slug,
      lessonId
    )
  }

  return updateLessonRecord(database, lessonId, payload)
}

export async function deleteLesson(database: D1Database, lessonId: string): Promise<boolean> {
  return deleteLessonRecord(database, lessonId)
}

export async function reorderLessons(
  database: D1Database,
  topicId: string,
  orderedIds: string[]
): Promise<boolean> {
  return reorderLessonsRecord(database, topicId, orderedIds)
}

export async function getLessonById(
  database: D1Database,
  lessonId: string
): Promise<Lesson | null> {
  return getLessonByIdRecord(database, lessonId)
}

export async function getLessonBySlug(
  database: D1Database,
  courseId: string,
  lessonSlug: string
): Promise<Lesson | null> {
  return getLessonBySlugRecord(database, courseId, lessonSlug)
}

export async function getEnrollment(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  return getEnrollmentRecord(database, userId, courseId)
}

export async function enrollCourse(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<Enrollment> {
  return enrollCourseRecord(database, userId, courseId)
}

export async function unenrollCourse(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<boolean> {
  return unenrollCourseRecord(database, userId, courseId)
}

export async function toggleLessonComplete(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean | null> {
  return toggleLessonCompleteRecord(database, userId, courseId, lessonId)
}

export async function getCourseProgress(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<number> {
  return getCourseProgressRecord(database, userId, courseId)
}

export async function saveNote(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string,
  note: string
): Promise<boolean> {
  return saveNoteRecord(database, userId, courseId, lessonId, note)
}

export async function getNote(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<string> {
  return getNoteRecord(database, userId, courseId, lessonId)
}
