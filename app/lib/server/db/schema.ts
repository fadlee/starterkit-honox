import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    usernameNormalized: text('username_normalized').notNull(),
    displayName: text('display_name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    usernameNormalizedUnique: uniqueIndex('users_username_normalized_unique').on(
      table.usernameNormalized
    ),
  })
)

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull(),
    expiresAtMs: integer('expires_at_ms').notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    expiresAtMsIdx: index('sessions_expires_at_ms_idx').on(table.expiresAtMs),
  })
)

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  difficultyLevel: text('difficulty_level', {
    enum: ['beginner', 'intermediate', 'advanced'],
  })
    .notNull()
    .default('beginner'),
  visibility: text('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('public'),
  featuredImage: text('featured_image').notNull().default(''),
  pricingModel: text('pricing_model', { enum: ['free', 'paid'] })
    .notNull()
    .default('free'),
  categoriesJson: text('categories_json').notNull().default('[]'),
  tagsJson: text('tags_json').notNull().default('[]'),
  author: text('author').notNull().default(''),
  isScheduled: integer('is_scheduled', { mode: 'boolean' }).notNull().default(false),
  scheduleDate: text('schedule_date'),
  isPublicCourse: integer('is_public_course', { mode: 'boolean' }).notNull().default(true),
  maxStudents: integer('max_students').notNull().default(0),
  certificate: integer('certificate', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const topics = sqliteTable(
  'topics',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    sortOrder: integer('sort_order').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueOrderPerCourse: uniqueIndex('topics_course_order_unique').on(table.courseId, table.sortOrder),
    courseOrderIdx: index('topics_course_order_idx').on(table.courseId, table.sortOrder),
  })
)

export const lessons = sqliteTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content').notNull().default(''),
    featuredImage: text('featured_image').notNull().default(''),
    videoUrl: text('video_url').notNull().default(''),
    videoPlaybackHours: integer('video_playback_hours').notNull().default(0),
    videoPlaybackMinutes: integer('video_playback_minutes').notNull().default(0),
    videoPlaybackSeconds: integer('video_playback_seconds').notNull().default(0),
    exerciseFilesJson: text('exercise_files_json').notNull().default('[]'),
    isPreview: integer('is_preview', { mode: 'boolean' }).notNull().default(false),
    previewType: text('preview_type', { enum: ['free', 'pro'] })
      .notNull()
      .default('free'),
    sortOrder: integer('sort_order').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueOrderPerTopic: uniqueIndex('lessons_topic_order_unique').on(table.topicId, table.sortOrder),
    uniqueSlugPerCourse: uniqueIndex('lessons_course_slug_unique').on(table.courseId, table.slug),
    topicOrderIdx: index('lessons_topic_order_idx').on(table.topicId, table.sortOrder),
  })
)

export const enrollments = sqliteTable(
  'enrollments',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    enrolledAt: text('enrolled_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueUserCourse: uniqueIndex('enrollments_user_course_unique').on(table.userId, table.courseId),
  })
)

export const enrollmentCompletedLessons = sqliteTable(
  'enrollment_completed_lessons',
  {
    enrollmentId: text('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: text('completed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.enrollmentId, table.lessonId] }),
    lessonIdIdx: index('enrollment_completed_lessons_lesson_idx').on(table.lessonId),
  })
)

export const lessonNotes = sqliteTable(
  'lesson_notes',
  {
    enrollmentId: text('enrollment_id')
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    note: text('note').notNull().default(''),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.enrollmentId, table.lessonId] }),
  })
)
