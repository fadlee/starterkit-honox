import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm'

import type { Course, Enrollment, Lesson, Topic, User, UserRole } from '@/types/lms'
import { getDb } from '@/lib/server/db/client'
import {
  toCourse,
  toEnrollment,
  toJsonStringArray,
  toLesson,
  toPublicUser,
  toTopic,
  type UserRow,
} from '@/lib/server/db/mappers'
import {
  courses,
  enrollmentCompletedLessons,
  enrollments,
  lessonNotes,
  lessons,
  sessions,
  topics,
  users,
} from '@/lib/server/db/schema'

function nowIso() {
  return new Date().toISOString()
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

const SORT_ORDER_INSERT_RETRY_LIMIT = 5

function collectErrorMessages(error: unknown): string[] {
  const messages: string[] = []
  let current: unknown = error
  const seen = new Set<unknown>()

  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current)
    const maybeError = current as { message?: unknown; cause?: unknown }
    if (typeof maybeError.message === 'string') {
      messages.push(maybeError.message)
    }
    current = maybeError.cause
  }

  if (messages.length === 0 && typeof error === 'string') {
    messages.push(error)
  }

  return messages
}

function isTopicSortOrderConflict(error: unknown): boolean {
  return collectErrorMessages(error).some((message) =>
    message.includes('UNIQUE constraint failed: topics.course_id, topics.sort_order')
  )
}

function isLessonSortOrderConflict(error: unknown): boolean {
  return collectErrorMessages(error).some((message) =>
    message.includes('UNIQUE constraint failed: lessons.topic_id, lessons.sort_order')
  )
}

async function getNextTopicSortOrder(
  db: ReturnType<typeof getDb>,
  courseId: string
): Promise<number> {
  const rows = await db
    .select({ sortOrder: topics.sortOrder })
    .from(topics)
    .where(eq(topics.courseId, courseId))
  return rows.reduce((maxOrder, row) => Math.max(maxOrder, row.sortOrder), -1) + 1
}

async function getNextLessonSortOrder(
  db: ReturnType<typeof getDb>,
  topicId: string
): Promise<number> {
  const rows = await db
    .select({ sortOrder: lessons.sortOrder })
    .from(lessons)
    .where(eq(lessons.topicId, topicId))
  return rows.reduce((maxOrder, row) => Math.max(maxOrder, row.sortOrder), -1) + 1
}

export async function cleanupExpiredSessions(database: D1Database, nowMs = Date.now()): Promise<void> {
  const db = getDb(database)
  await db.delete(sessions).where(sql`${sessions.expiresAtMs} <= ${nowMs}`)
}

export async function findUserAuthByNormalizedUsername(
  database: D1Database,
  usernameNormalized: string
): Promise<(UserRow & { passwordHash: string }) | null> {
  const db = getDb(database)
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.usernameNormalized, usernameNormalized))
    .limit(1)
  return row ?? null
}

export async function createUserRecord(
  database: D1Database,
  data: {
    username: string
    displayName: string
    passwordHash: string
    role?: UserRole
  }
): Promise<User> {
  const db = getDb(database)
  const timestamp = nowIso()
  const id = generateId()
  const role = data.role ?? 'user'

  await db.insert(users).values({
    id,
    username: data.username,
    usernameNormalized: normalizeUsername(data.username),
    displayName: data.displayName,
    passwordHash: data.passwordHash,
    role,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  const [created] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!created) {
    throw new Error('failed to create user')
  }

  return toPublicUser(created)
}

export async function listUsers(database: D1Database): Promise<User[]> {
  const db = getDb(database)
  const rows = await db.select().from(users).orderBy(asc(users.createdAt))
  return rows.map(toPublicUser)
}

export async function getUserById(database: D1Database, userId: string): Promise<User | null> {
  const db = getDb(database)
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return row ? toPublicUser(row) : null
}

export async function updateUserRole(
  database: D1Database,
  userId: string,
  role: UserRole
): Promise<User | null> {
  const db = getDb(database)
  await db
    .update(users)
    .set({
      role,
      updatedAt: nowIso(),
    })
    .where(eq(users.id, userId))

  return getUserById(database, userId)
}

export async function deleteUser(database: D1Database, userId: string): Promise<boolean> {
  const db = getDb(database)
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!existing) return false
  await db.delete(users).where(eq(users.id, userId))
  return true
}

export async function createSession(database: D1Database, userId: string, expiresAtMs: number): Promise<string> {
  const db = getDb(database)
  const id = generateId()
  await db.insert(sessions).values({
    id,
    userId,
    createdAt: nowIso(),
    expiresAtMs,
  })
  return id
}

export async function deleteSession(database: D1Database, sessionId: string): Promise<void> {
  const db = getDb(database)
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function getSessionUser(database: D1Database, sessionId: string): Promise<User | null> {
  const db = getDb(database)
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      usernameNormalized: users.usernameNormalized,
      displayName: users.displayName,
      passwordHash: users.passwordHash,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      expiresAtMs: sessions.expiresAtMs,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (!row) return null
  if (row.expiresAtMs <= Date.now()) {
    await deleteSession(database, sessionId)
    return null
  }

  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    role: row.role,
    createdAt: row.createdAt,
  }
}

export async function listCourses(database: D1Database): Promise<Course[]> {
  const db = getDb(database)
  const rows = await db.select().from(courses).orderBy(asc(courses.createdAt))
  return rows.map(toCourse)
}

export async function getCourseById(database: D1Database, courseId: string): Promise<Course | null> {
  const db = getDb(database)
  const [row] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1)
  return row ? toCourse(row) : null
}

export async function getCourseBySlug(database: D1Database, slug: string): Promise<Course | null> {
  const db = getDb(database)
  const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1)
  return row ? toCourse(row) : null
}

export async function insertCourse(
  database: D1Database,
  data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }
): Promise<Course> {
  const db = getDb(database)
  const id = data.id ?? generateId()
  const createdAt = data.createdAt ?? nowIso()
  const updatedAt = data.updatedAt ?? nowIso()

  await db.insert(courses).values({
    id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    difficultyLevel: data.difficultyLevel,
    visibility: data.visibility,
    featuredImage: data.featuredImage,
    pricingModel: data.pricingModel,
    categoriesJson: toJsonStringArray(data.categories),
    tagsJson: toJsonStringArray(data.tags),
    author: data.author,
    isScheduled: data.isScheduled,
    scheduleDate: data.scheduleDate || null,
    isPublicCourse: data.isPublicCourse,
    maxStudents: data.maxStudents,
    certificate: data.certificate,
    status: data.status,
    createdAt,
    updatedAt,
  })

  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1)
  if (!row) throw new Error('failed to create course')
  return toCourse(row)
}

export async function updateCourse(
  database: D1Database,
  courseId: string,
  data: Partial<Course>
): Promise<Course | null> {
  const db = getDb(database)
  const payload: Partial<typeof courses.$inferInsert> = {
    updatedAt: nowIso(),
  }

  if (data.title !== undefined) payload.title = data.title
  if (data.slug !== undefined) payload.slug = data.slug
  if (data.description !== undefined) payload.description = data.description
  if (data.difficultyLevel !== undefined) payload.difficultyLevel = data.difficultyLevel
  if (data.visibility !== undefined) payload.visibility = data.visibility
  if (data.featuredImage !== undefined) payload.featuredImage = data.featuredImage
  if (data.pricingModel !== undefined) payload.pricingModel = data.pricingModel
  if (data.categories !== undefined) payload.categoriesJson = toJsonStringArray(data.categories)
  if (data.tags !== undefined) payload.tagsJson = toJsonStringArray(data.tags)
  if (data.author !== undefined) payload.author = data.author
  if (data.isScheduled !== undefined) payload.isScheduled = data.isScheduled
  if (data.scheduleDate !== undefined) payload.scheduleDate = data.scheduleDate || null
  if (data.isPublicCourse !== undefined) payload.isPublicCourse = data.isPublicCourse
  if (data.maxStudents !== undefined) payload.maxStudents = data.maxStudents
  if (data.certificate !== undefined) payload.certificate = data.certificate
  if (data.status !== undefined) payload.status = data.status

  await db.update(courses).set(payload).where(eq(courses.id, courseId))
  return getCourseById(database, courseId)
}

export async function deleteCourse(database: D1Database, courseId: string): Promise<boolean> {
  const db = getDb(database)
  const [existing] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)
  if (!existing) return false
  await db.delete(courses).where(eq(courses.id, courseId))
  return true
}

export async function listTopicsByCourse(database: D1Database, courseId: string): Promise<Topic[]> {
  const db = getDb(database)
  const rows = await db
    .select()
    .from(topics)
    .where(eq(topics.courseId, courseId))
    .orderBy(asc(topics.sortOrder))
  return rows.map(toTopic)
}

export async function getTopicById(database: D1Database, topicId: string): Promise<Topic | null> {
  const db = getDb(database)
  const [row] = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1)
  return row ? toTopic(row) : null
}

export async function insertTopic(
  database: D1Database,
  data: Omit<Topic, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<Topic> {
  const db = getDb(database)
  const id = data.id ?? generateId()
  let order = data.order

  for (let attempt = 0; attempt < SORT_ORDER_INSERT_RETRY_LIMIT; attempt += 1) {
    try {
      await db.insert(topics).values({
        id,
        courseId: data.courseId,
        title: data.title,
        sortOrder: order,
        createdAt: data.createdAt ?? nowIso(),
      })
      break
    } catch (error) {
      const shouldRetry =
        isTopicSortOrderConflict(error) && attempt < SORT_ORDER_INSERT_RETRY_LIMIT - 1
      if (!shouldRetry) {
        throw error
      }
      order = await getNextTopicSortOrder(db, data.courseId)
    }
  }

  const [row] = await db.select().from(topics).where(eq(topics.id, id)).limit(1)
  if (!row) throw new Error('failed to create topic')
  return toTopic(row)
}

export async function updateTopic(
  database: D1Database,
  topicId: string,
  data: Partial<Topic>
): Promise<Topic | null> {
  const db = getDb(database)
  const payload: Partial<typeof topics.$inferInsert> = {}
  if (data.title !== undefined) payload.title = data.title
  if (data.order !== undefined) payload.sortOrder = data.order
  if (Object.keys(payload).length > 0) {
    await db.update(topics).set(payload).where(eq(topics.id, topicId))
  }
  return getTopicById(database, topicId)
}

export async function deleteTopic(database: D1Database, topicId: string): Promise<boolean> {
  const db = getDb(database)
  const [existing] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)
  if (!existing) return false
  await db.delete(topics).where(eq(topics.id, topicId))
  return true
}

export async function reorderTopics(
  database: D1Database,
  courseId: string,
  orderedIds: string[]
): Promise<boolean> {
  const db = getDb(database)
  const existing = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.courseId, courseId))
  if (existing.length !== orderedIds.length) return false

  const known = new Set(existing.map((row) => row.id))
  if (orderedIds.some((id) => !known.has(id))) return false
  if (orderedIds.length === 0) return true

  const cases = sql.join(
    orderedIds.map((id, index) => sql`WHEN ${id} THEN ${index}`),
    sql.raw(' ')
  )

  await db
    .update(topics)
    .set({
      sortOrder: sql`CASE ${topics.id} ${cases} END`,
    })
    .where(and(eq(topics.courseId, courseId), inArray(topics.id, orderedIds)))

  return true
}

export async function listLessonsByTopic(database: D1Database, topicId: string): Promise<Lesson[]> {
  const db = getDb(database)
  const rows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.topicId, topicId))
    .orderBy(asc(lessons.sortOrder))
  return rows.map(toLesson)
}

export async function getLessonById(database: D1Database, lessonId: string): Promise<Lesson | null> {
  const db = getDb(database)
  const [row] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1)
  return row ? toLesson(row) : null
}

export async function getLessonBySlug(
  database: D1Database,
  courseId: string,
  lessonSlug: string
): Promise<Lesson | null> {
  const db = getDb(database)
  const [row] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), eq(lessons.slug, lessonSlug)))
    .limit(1)
  return row ? toLesson(row) : null
}

export async function insertLesson(
  database: D1Database,
  data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }
): Promise<Lesson> {
  const db = getDb(database)
  const id = data.id ?? generateId()
  const timestamp = nowIso()
  let order = data.order

  for (let attempt = 0; attempt < SORT_ORDER_INSERT_RETRY_LIMIT; attempt += 1) {
    try {
      await db.insert(lessons).values({
        id,
        topicId: data.topicId,
        courseId: data.courseId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        featuredImage: data.featuredImage,
        videoUrl: data.videoUrl,
        videoPlaybackHours: data.videoPlaybackHours,
        videoPlaybackMinutes: data.videoPlaybackMinutes,
        videoPlaybackSeconds: data.videoPlaybackSeconds,
        exerciseFilesJson: toJsonStringArray(data.exerciseFiles),
        isPreview: data.isPreview,
        previewType: data.previewType,
        sortOrder: order,
        createdAt: data.createdAt ?? timestamp,
        updatedAt: data.updatedAt ?? timestamp,
      })
      break
    } catch (error) {
      const shouldRetry =
        isLessonSortOrderConflict(error) && attempt < SORT_ORDER_INSERT_RETRY_LIMIT - 1
      if (!shouldRetry) {
        throw error
      }
      order = await getNextLessonSortOrder(db, data.topicId)
    }
  }

  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1)
  if (!row) throw new Error('failed to create lesson')
  return toLesson(row)
}

export async function updateLesson(
  database: D1Database,
  lessonId: string,
  data: Partial<Lesson>
): Promise<Lesson | null> {
  const db = getDb(database)
  const payload: Partial<typeof lessons.$inferInsert> = {
    updatedAt: nowIso(),
  }
  if (data.title !== undefined) payload.title = data.title
  if (data.slug !== undefined) payload.slug = data.slug
  if (data.content !== undefined) payload.content = data.content
  if (data.featuredImage !== undefined) payload.featuredImage = data.featuredImage
  if (data.videoUrl !== undefined) payload.videoUrl = data.videoUrl
  if (data.videoPlaybackHours !== undefined) payload.videoPlaybackHours = data.videoPlaybackHours
  if (data.videoPlaybackMinutes !== undefined) payload.videoPlaybackMinutes = data.videoPlaybackMinutes
  if (data.videoPlaybackSeconds !== undefined) payload.videoPlaybackSeconds = data.videoPlaybackSeconds
  if (data.exerciseFiles !== undefined) payload.exerciseFilesJson = toJsonStringArray(data.exerciseFiles)
  if (data.isPreview !== undefined) payload.isPreview = data.isPreview
  if (data.previewType !== undefined) payload.previewType = data.previewType
  if (data.order !== undefined) payload.sortOrder = data.order

  await db.update(lessons).set(payload).where(eq(lessons.id, lessonId))
  return getLessonById(database, lessonId)
}

export async function deleteLesson(database: D1Database, lessonId: string): Promise<boolean> {
  const db = getDb(database)
  const [existing] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1)
  if (!existing) return false
  await db.delete(lessons).where(eq(lessons.id, lessonId))
  return true
}

export async function reorderLessons(
  database: D1Database,
  topicId: string,
  orderedIds: string[]
): Promise<boolean> {
  const db = getDb(database)
  const existing = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.topicId, topicId))

  if (existing.length !== orderedIds.length) return false
  const known = new Set(existing.map((row) => row.id))
  if (orderedIds.some((id) => !known.has(id))) return false
  if (orderedIds.length === 0) return true

  const cases = sql.join(
    orderedIds.map((id, index) => sql`WHEN ${id} THEN ${index}`),
    sql.raw(' ')
  )

  await db
    .update(lessons)
    .set({
      sortOrder: sql`CASE ${lessons.id} ${cases} END`,
    })
    .where(and(eq(lessons.topicId, topicId), inArray(lessons.id, orderedIds)))

  return true
}

async function getEnrollmentRow(
  database: D1Database,
  userId: string,
  courseId: string
) {
  const db = getDb(database)
  const [row] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1)
  return row ?? null
}

async function buildEnrollment(database: D1Database, enrollmentRow: typeof enrollments.$inferSelect): Promise<Enrollment> {
  const db = getDb(database)
  const completionRows = await db
    .select({ lessonId: enrollmentCompletedLessons.lessonId })
    .from(enrollmentCompletedLessons)
    .where(eq(enrollmentCompletedLessons.enrollmentId, enrollmentRow.id))

  const noteRows = await db
    .select({ lessonId: lessonNotes.lessonId, note: lessonNotes.note })
    .from(lessonNotes)
    .where(eq(lessonNotes.enrollmentId, enrollmentRow.id))

  return toEnrollment(
    enrollmentRow,
    completionRows.map((row) => row.lessonId),
    noteRows
  )
}

export async function getEnrollment(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  const enrollmentRow = await getEnrollmentRow(database, userId, courseId)
  if (!enrollmentRow) return null
  return buildEnrollment(database, enrollmentRow)
}

export async function enrollCourse(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<Enrollment> {
  const existing = await getEnrollmentRow(database, userId, courseId)
  if (existing) {
    return buildEnrollment(database, existing)
  }

  const db = getDb(database)
  const id = generateId()
  await db.insert(enrollments).values({
    id,
    userId,
    courseId,
    enrolledAt: nowIso(),
  })

  const [row] = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1)
  if (!row) throw new Error('failed to create enrollment')
  return buildEnrollment(database, row)
}

export async function unenrollCourse(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<boolean> {
  const db = getDb(database)
  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1)
  if (!existing) return false
  await db
    .delete(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
  return true
}

export async function toggleLessonComplete(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean | null> {
  const enrollmentRow = await getEnrollmentRow(database, userId, courseId)
  if (!enrollmentRow) return null

  const db = getDb(database)
  const [current] = await db
    .select()
    .from(enrollmentCompletedLessons)
    .where(
      and(
        eq(enrollmentCompletedLessons.enrollmentId, enrollmentRow.id),
        eq(enrollmentCompletedLessons.lessonId, lessonId)
      )
    )
    .limit(1)

  if (current) {
    await db
      .delete(enrollmentCompletedLessons)
      .where(
        and(
          eq(enrollmentCompletedLessons.enrollmentId, enrollmentRow.id),
          eq(enrollmentCompletedLessons.lessonId, lessonId)
        )
      )
    return false
  }

  await db.insert(enrollmentCompletedLessons).values({
    enrollmentId: enrollmentRow.id,
    lessonId,
    completedAt: nowIso(),
  })
  return true
}

export async function getCourseProgress(
  database: D1Database,
  userId: string,
  courseId: string
): Promise<number> {
  const enrollmentRow = await getEnrollmentRow(database, userId, courseId)
  if (!enrollmentRow) return 0

  const db = getDb(database)
  const [totalRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(lessons)
    .where(eq(lessons.courseId, courseId))

  const totalLessons = Number(totalRow?.count ?? 0)
  if (totalLessons <= 0) return 0

  const [completedRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(enrollmentCompletedLessons)
    .innerJoin(lessons, eq(lessons.id, enrollmentCompletedLessons.lessonId))
    .where(
      and(
        eq(enrollmentCompletedLessons.enrollmentId, enrollmentRow.id),
        eq(lessons.courseId, courseId)
      )
    )

  const completedLessons = Number(completedRow?.count ?? 0)
  return Math.round((completedLessons / totalLessons) * 100)
}

export async function saveNote(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string,
  note: string
): Promise<boolean> {
  const enrollmentRow = await getEnrollmentRow(database, userId, courseId)
  if (!enrollmentRow) return false
  const db = getDb(database)
  await db
    .insert(lessonNotes)
    .values({
      enrollmentId: enrollmentRow.id,
      lessonId,
      note,
      updatedAt: nowIso(),
    })
    .onConflictDoUpdate({
      target: [lessonNotes.enrollmentId, lessonNotes.lessonId],
      set: {
        note,
        updatedAt: nowIso(),
      },
    })
  return true
}

export async function getNote(
  database: D1Database,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<string> {
  const enrollmentRow = await getEnrollmentRow(database, userId, courseId)
  if (!enrollmentRow) return ''

  const db = getDb(database)
  const [row] = await db
    .select({ note: lessonNotes.note })
    .from(lessonNotes)
    .where(
      and(eq(lessonNotes.enrollmentId, enrollmentRow.id), eq(lessonNotes.lessonId, lessonId))
    )
    .limit(1)
  return row?.note ?? ''
}

export async function findCourseBySlugExcludingId(
  database: D1Database,
  slug: string,
  excludeCourseId?: string
): Promise<Course | null> {
  const db = getDb(database)
  const where = excludeCourseId
    ? and(eq(courses.slug, slug), ne(courses.id, excludeCourseId))
    : eq(courses.slug, slug)
  const [row] = await db.select().from(courses).where(where).limit(1)
  return row ? toCourse(row) : null
}

export async function findLessonByCourseSlugExcludingId(
  database: D1Database,
  courseId: string,
  slug: string,
  excludeLessonId?: string
): Promise<Lesson | null> {
  const db = getDb(database)
  const where = excludeLessonId
    ? and(eq(lessons.courseId, courseId), eq(lessons.slug, slug), ne(lessons.id, excludeLessonId))
    : and(eq(lessons.courseId, courseId), eq(lessons.slug, slug))

  const [row] = await db.select().from(lessons).where(where).limit(1)
  return row ? toLesson(row) : null
}
