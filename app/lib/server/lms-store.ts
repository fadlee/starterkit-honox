import type { Course, Enrollment, Lesson, StoredUser, Topic, User, UserRole } from '@/types/lms'

type SessionRecord = {
  id: string
  userId: string
  createdAt: string
  expiresAt: number
}

type LmsMemoryStore = {
  users: StoredUser[]
  sessions: SessionRecord[]
  courses: Course[]
  topics: Topic[]
  lessons: Lesson[]
  enrollments: Enrollment[]
}

type CourseInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
type TopicInput = Omit<Topic, 'id' | 'createdAt'>
type LessonInput = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>

declare global {
  // eslint-disable-next-line no-var
  var __LMS_MOCK_STORE__: LmsMemoryStore | undefined
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function nowIso() {
  return new Date().toISOString()
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
  }
}

function buildDefaultStore(): LmsMemoryStore {
  return {
    users: [],
    sessions: [],
    courses: [],
    topics: [],
    lessons: [],
    enrollments: [],
  }
}

function createCourseInternal(store: LmsMemoryStore, data: CourseInput): Course {
  const timestamp = nowIso()
  const course: Course = {
    ...data,
    id: generateId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  store.courses.push(course)
  return course
}

function createTopicInternal(store: LmsMemoryStore, data: TopicInput): Topic {
  const topic: Topic = {
    ...data,
    id: generateId(),
    createdAt: nowIso(),
  }
  store.topics.push(topic)
  return topic
}

function normalizeSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function createLessonInternal(store: LmsMemoryStore, data: LessonInput): Lesson {
  const timestamp = nowIso()
  const lesson: Lesson = {
    ...data,
    slug: data.slug || normalizeSlug(data.title),
    id: generateId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  store.lessons.push(lesson)
  return lesson
}

function seedStore(store: LmsMemoryStore) {
  if (store.users.length > 0 || store.courses.length > 0) return

  const admin: StoredUser = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    displayName: 'Administrator',
    role: 'admin',
    createdAt: nowIso(),
  }
  store.users.push(admin)

  const course1 = createCourseInternal(store, {
    title: 'Belajar Tajwid Al-Quran',
    slug: 'belajar-tajwid-al-quran',
    description:
      'Pelajari ilmu tajwid dari dasar hingga mahir. Kursus ini mencakup hukum nun mati dan tanwin, mad, dan kaidah membaca Al-Quran dengan baik.',
    difficultyLevel: 'beginner',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
    pricingModel: 'free',
    categories: ['Tajwid', 'Alquran'],
    tags: ['tajwid', 'quran', 'pemula'],
    author: 'Ustadz Ahmad',
    isScheduled: false,
    scheduleDate: '',
    isPublicCourse: true,
    maxStudents: 100,
    certificate: true,
    status: 'published',
  })

  const topic1 = createTopicInternal(store, {
    courseId: course1.id,
    title: 'Pengenalan Ilmu Tajwid',
    order: 0,
  })

  createLessonInternal(store, {
    topicId: topic1.id,
    courseId: course1.id,
    title: 'Apa Itu Ilmu Tajwid?',
    slug: 'apa-itu-ilmu-tajwid',
    content:
      '<h2>Pengertian Ilmu Tajwid</h2><p>Tajwid adalah ilmu untuk membaca Al-Quran sesuai kaidah yang benar.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=iBWqLsGPNJo',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 12,
    videoPlaybackSeconds: 30,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 0,
  })

  createLessonInternal(store, {
    topicId: topic1.id,
    courseId: course1.id,
    title: 'Makharijul Huruf',
    slug: 'makharijul-huruf',
    content:
      '<h2>Makharijul Huruf</h2><p>Makharijul huruf adalah tempat keluarnya huruf hijaiyah.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=R0hLA10MbKg',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 15,
    videoPlaybackSeconds: 45,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 1,
  })

  const topic2 = createTopicInternal(store, {
    courseId: course1.id,
    title: 'Hukum Nun Mati dan Tanwin',
    order: 1,
  })

  createLessonInternal(store, {
    topicId: topic2.id,
    courseId: course1.id,
    title: 'Izhar Halqi',
    slug: 'izhar-halqi',
    content: '<h2>Izhar Halqi</h2><p>Izhar berarti membaca jelas tanpa dengung.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=pEeXz_CFxYc',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 10,
    videoPlaybackSeconds: 20,
    exerciseFiles: [],
    isPreview: false,
    previewType: 'free',
    order: 0,
  })

  const course2 = createCourseInternal(store, {
    title: 'Pengantar Fiqih Islam',
    slug: 'pengantar-fiqih-islam',
    description:
      'Kursus dasar fiqih Islam meliputi thaharah, shalat, dan puasa dengan pembahasan sistematis untuk pelajar menengah.',
    difficultyLevel: 'intermediate',
    visibility: 'public',
    featuredImage: 'https://images.unsplash.com/photo-1585036156171-384164a8c956?w=800&q=80',
    pricingModel: 'free',
    categories: ['Fiqih', 'Ushul Fiqih'],
    tags: ['fiqih', 'ibadah', 'shalat'],
    author: 'Ustadzah Fatimah',
    isScheduled: false,
    scheduleDate: '',
    isPublicCourse: true,
    maxStudents: 80,
    certificate: true,
    status: 'published',
  })

  const topic3 = createTopicInternal(store, {
    courseId: course2.id,
    title: 'Bab Thaharah (Bersuci)',
    order: 0,
  })

  createLessonInternal(store, {
    topicId: topic3.id,
    courseId: course2.id,
    title: 'Pengertian dan Macam-Macam Thaharah',
    slug: 'pengertian-dan-macam-macam-thaharah',
    content: '<h2>Thaharah</h2><p>Thaharah adalah bersuci dari hadats dan najis.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=s8GBf0XEhBQ',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 18,
    videoPlaybackSeconds: 30,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 0,
  })

  createLessonInternal(store, {
    topicId: topic3.id,
    courseId: course2.id,
    title: 'Tata Cara Wudhu yang Benar',
    slug: 'tata-cara-wudhu-yang-benar',
    content: '<h2>Rukun Wudhu</h2><p>Rukun wudhu terdiri dari enam perkara utama.</p>',
    featuredImage: '',
    videoUrl: 'https://www.youtube.com/watch?v=mOjFBLSCJaI',
    videoPlaybackHours: 0,
    videoPlaybackMinutes: 12,
    videoPlaybackSeconds: 45,
    exerciseFiles: [],
    isPreview: true,
    previewType: 'free',
    order: 1,
  })
}

function getStore(): LmsMemoryStore {
  if (!globalThis.__LMS_MOCK_STORE__) {
    const store = buildDefaultStore()
    seedStore(store)
    globalThis.__LMS_MOCK_STORE__ = store
  }
  return globalThis.__LMS_MOCK_STORE__
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

function cleanupLessonReferences(lessonIds: string[]) {
  const store = getStore()
  if (lessonIds.length === 0) return

  const blocked = new Set(lessonIds)
  for (const enrollment of store.enrollments) {
    enrollment.completedLessons = enrollment.completedLessons.filter((id) => !blocked.has(id))
    for (const lessonId of lessonIds) {
      if (lessonId in enrollment.notes) {
        delete enrollment.notes[lessonId]
      }
    }
  }
}

export function listUsers(): User[] {
  const store = getStore()
  return store.users.map(toPublicUser)
}

export function getUserById(id: string): User | null {
  const store = getStore()
  const user = store.users.find((item) => item.id === id)
  return user ? toPublicUser(user) : null
}

export function getStoredUserByUsername(username: string): StoredUser | null {
  const store = getStore()
  const normalized = username.trim().toLowerCase()
  const found = store.users.find((item) => item.username.toLowerCase() === normalized)
  return found ?? null
}

export function createUser(data: { username: string; password: string; displayName: string }): User | null {
  const store = getStore()
  const normalizedUsername = data.username.trim()
  if (!normalizedUsername) return null
  const exists = store.users.some((item) => item.username.toLowerCase() === normalizedUsername.toLowerCase())
  if (exists) return null

  const user: StoredUser = {
    id: generateId(),
    username: normalizedUsername,
    password: data.password,
    displayName: data.displayName.trim(),
    role: 'user',
    createdAt: nowIso(),
  }

  store.users.push(user)
  return toPublicUser(user)
}

export function authenticateUser(username: string, password: string): User | null {
  const store = getStore()
  const normalized = username.trim().toLowerCase()
  const user = store.users.find(
    (item) => item.username.toLowerCase() === normalized && item.password === password
  )
  return user ? toPublicUser(user) : null
}

export function updateUserRole(userId: string, role: UserRole): User | null {
  const store = getStore()
  const index = store.users.findIndex((item) => item.id === userId)
  if (index === -1) return null

  const current = store.users[index]
  const updated: StoredUser = {
    ...current,
    role,
  }
  store.users[index] = updated
  return toPublicUser(updated)
}

export function deleteUser(userId: string): boolean {
  const store = getStore()
  const index = store.users.findIndex((item) => item.id === userId)
  if (index === -1) return false

  store.users.splice(index, 1)
  store.sessions = store.sessions.filter((session) => session.userId !== userId)
  store.enrollments = store.enrollments.filter((enrollment) => enrollment.userId !== userId)
  return true
}

export function createSession(userId: string): string {
  const store = getStore()
  const now = Date.now()
  store.sessions = store.sessions.filter((session) => session.expiresAt > now)

  const session: SessionRecord = {
    id: generateId(),
    userId,
    createdAt: nowIso(),
    expiresAt: now + SESSION_TTL_MS,
  }
  store.sessions.push(session)
  return session.id
}

export function getSessionUser(sessionId: string | undefined): User | null {
  if (!sessionId) return null
  const store = getStore()
  const now = Date.now()
  const session = store.sessions.find((item) => item.id === sessionId)
  if (!session) return null
  if (session.expiresAt <= now) {
    store.sessions = store.sessions.filter((item) => item.id !== session.id)
    return null
  }

  const user = store.users.find((item) => item.id === session.userId)
  if (!user) return null
  return toPublicUser(user)
}

export function deleteSession(sessionId: string | undefined): void {
  if (!sessionId) return
  const store = getStore()
  store.sessions = store.sessions.filter((session) => session.id !== sessionId)
}

export function listCourses(): Course[] {
  const store = getStore()
  return [...store.courses]
}

export function getCourseById(courseId: string): Course | null {
  const store = getStore()
  return store.courses.find((course) => course.id === courseId) ?? null
}

export function getCourseBySlug(slug: string): Course | null {
  const store = getStore()
  return store.courses.find((course) => course.slug === slug) ?? null
}

export function createCourse(data: CourseInput): Course {
  const store = getStore()
  return createCourseInternal(store, data)
}

export function updateCourse(courseId: string, data: Partial<Course>): Course | null {
  const store = getStore()
  const index = store.courses.findIndex((course) => course.id === courseId)
  if (index === -1) return null

  const current = store.courses[index]
  const updated: Course = {
    ...current,
    ...data,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  }

  store.courses[index] = updated
  return updated
}

export function deleteCourse(courseId: string): boolean {
  const store = getStore()
  const index = store.courses.findIndex((course) => course.id === courseId)
  if (index === -1) return false

  store.courses.splice(index, 1)

  const removedTopicIds = store.topics.filter((topic) => topic.courseId === courseId).map((topic) => topic.id)
  store.topics = store.topics.filter((topic) => topic.courseId !== courseId)

  const removedLessonIds = store.lessons
    .filter((lesson) => lesson.courseId === courseId || removedTopicIds.includes(lesson.topicId))
    .map((lesson) => lesson.id)
  store.lessons = store.lessons.filter(
    (lesson) => lesson.courseId !== courseId && !removedTopicIds.includes(lesson.topicId)
  )

  cleanupLessonReferences(removedLessonIds)
  store.enrollments = store.enrollments.filter((enrollment) => enrollment.courseId !== courseId)

  return true
}

export function listTopicsByCourse(courseId: string): Topic[] {
  const store = getStore()
  return sortByOrder(store.topics.filter((topic) => topic.courseId === courseId))
}

export function createTopic(data: TopicInput): Topic {
  const store = getStore()
  return createTopicInternal(store, data)
}

export function updateTopic(topicId: string, data: Partial<Topic>): Topic | null {
  const store = getStore()
  const index = store.topics.findIndex((topic) => topic.id === topicId)
  if (index === -1) return null

  const current = store.topics[index]
  const updated: Topic = {
    ...current,
    ...data,
    id: current.id,
    createdAt: current.createdAt,
  }

  store.topics[index] = updated
  return updated
}

export function deleteTopic(topicId: string): boolean {
  const store = getStore()
  const index = store.topics.findIndex((topic) => topic.id === topicId)
  if (index === -1) return false

  store.topics.splice(index, 1)

  const removedLessonIds = store.lessons
    .filter((lesson) => lesson.topicId === topicId)
    .map((lesson) => lesson.id)
  store.lessons = store.lessons.filter((lesson) => lesson.topicId !== topicId)
  cleanupLessonReferences(removedLessonIds)

  return true
}

export function reorderTopics(courseId: string, orderedIds: string[]): boolean {
  const store = getStore()
  const topics = store.topics.filter((topic) => topic.courseId === courseId)
  if (topics.length !== orderedIds.length) return false

  const known = new Set(topics.map((topic) => topic.id))
  for (const id of orderedIds) {
    if (!known.has(id)) return false
  }

  for (const topic of topics) {
    const order = orderedIds.indexOf(topic.id)
    topic.order = order
  }

  return true
}

export function getTopicById(topicId: string): Topic | null {
  const store = getStore()
  return store.topics.find((topic) => topic.id === topicId) ?? null
}

export function listLessonsByTopic(topicId: string): Lesson[] {
  const store = getStore()
  return sortByOrder(store.lessons.filter((lesson) => lesson.topicId === topicId))
}

export function createLesson(data: LessonInput): Lesson {
  const store = getStore()
  return createLessonInternal(store, data)
}

export function updateLesson(lessonId: string, data: Partial<Lesson>): Lesson | null {
  const store = getStore()
  const index = store.lessons.findIndex((lesson) => lesson.id === lessonId)
  if (index === -1) return null

  const current = store.lessons[index]
  const updated: Lesson = {
    ...current,
    ...data,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
  }

  store.lessons[index] = updated
  return updated
}

export function deleteLesson(lessonId: string): boolean {
  const store = getStore()
  const index = store.lessons.findIndex((lesson) => lesson.id === lessonId)
  if (index === -1) return false

  store.lessons.splice(index, 1)
  cleanupLessonReferences([lessonId])
  return true
}

export function reorderLessons(topicId: string, orderedIds: string[]): boolean {
  const store = getStore()
  const lessons = store.lessons.filter((lesson) => lesson.topicId === topicId)
  if (lessons.length !== orderedIds.length) return false

  const known = new Set(lessons.map((lesson) => lesson.id))
  for (const id of orderedIds) {
    if (!known.has(id)) return false
  }

  for (const lesson of lessons) {
    const order = orderedIds.indexOf(lesson.id)
    lesson.order = order
  }

  return true
}

export function getLessonById(lessonId: string): Lesson | null {
  const store = getStore()
  return store.lessons.find((lesson) => lesson.id === lessonId) ?? null
}

export function getLessonBySlug(courseId: string, lessonSlug: string): Lesson | null {
  const store = getStore()
  const topics = store.topics.filter((topic) => topic.courseId === courseId)
  const topicIds = new Set(topics.map((topic) => topic.id))
  return (
    store.lessons.find((lesson) => topicIds.has(lesson.topicId) && lesson.slug === lessonSlug) ?? null
  )
}

export function getEnrollment(userId: string, courseId: string): Enrollment | null {
  const store = getStore()
  return (
    store.enrollments.find((enrollment) => enrollment.userId === userId && enrollment.courseId === courseId) ??
    null
  )
}

export function enrollCourse(userId: string, courseId: string): Enrollment {
  const store = getStore()
  const existing = getEnrollment(userId, courseId)
  if (existing) return existing

  const enrollment: Enrollment = {
    id: generateId(),
    userId,
    courseId,
    enrolledAt: nowIso(),
    completedLessons: [],
    notes: {},
  }

  store.enrollments.push(enrollment)
  return enrollment
}

export function unenrollCourse(userId: string, courseId: string): boolean {
  const store = getStore()
  const before = store.enrollments.length
  store.enrollments = store.enrollments.filter(
    (enrollment) => !(enrollment.userId === userId && enrollment.courseId === courseId)
  )
  return before !== store.enrollments.length
}

export function toggleLessonComplete(userId: string, courseId: string, lessonId: string): boolean | null {
  const enrollment = getEnrollment(userId, courseId)
  if (!enrollment) return null

  const index = enrollment.completedLessons.indexOf(lessonId)
  if (index === -1) {
    enrollment.completedLessons.push(lessonId)
    return true
  }

  enrollment.completedLessons.splice(index, 1)
  return false
}

export function getCourseProgress(userId: string, courseId: string): number {
  const enrollment = getEnrollment(userId, courseId)
  if (!enrollment) return 0

  const topics = listTopicsByCourse(courseId)
  const topicIds = new Set(topics.map((topic) => topic.id))
  const totalLessons = getStore().lessons.filter((lesson) => topicIds.has(lesson.topicId)).length

  if (totalLessons === 0) return 0
  return Math.round((enrollment.completedLessons.length / totalLessons) * 100)
}

export function saveNote(userId: string, courseId: string, lessonId: string, note: string): boolean {
  const enrollment = getEnrollment(userId, courseId)
  if (!enrollment) return false
  enrollment.notes[lessonId] = note
  return true
}

export function getNote(userId: string, courseId: string, lessonId: string): string {
  const enrollment = getEnrollment(userId, courseId)
  if (!enrollment) return ''
  return enrollment.notes[lessonId] || ''
}
