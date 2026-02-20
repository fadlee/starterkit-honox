import type { Course, Lesson, Topic } from '@/types/lms'

import { badRequest } from '@/lib/server/api-utils'

type CourseInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
type TopicInput = Omit<Topic, 'id' | 'createdAt'>
type LessonInput = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asTrimmedString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return value
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
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

export function parseCourseCreateInput(body: Record<string, unknown>): CourseInput {
  const title = asTrimmedString(body.title)
  if (!title) {
    badRequest('title is required')
  }

  const difficultyLevel: Course['difficultyLevel'] =
    body.difficultyLevel === 'intermediate' || body.difficultyLevel === 'advanced'
      ? body.difficultyLevel
      : 'beginner'

  const visibility: Course['visibility'] = body.visibility === 'private' ? 'private' : 'public'
  const pricingModel: Course['pricingModel'] = body.pricingModel === 'paid' ? 'paid' : 'free'
  const status: Course['status'] = body.status === 'published' ? 'published' : 'draft'

  return {
    title,
    slug: asTrimmedString(body.slug) || generateSlug(title),
    description: asString(body.description),
    difficultyLevel,
    visibility,
    featuredImage: asString(body.featuredImage),
    pricingModel,
    categories: asStringArray(body.categories),
    tags: asStringArray(body.tags),
    author: asString(body.author),
    isScheduled: asBoolean(body.isScheduled, false),
    scheduleDate: asString(body.scheduleDate),
    isPublicCourse: asBoolean(body.isPublicCourse, true),
    maxStudents: asNumber(body.maxStudents, 0),
    certificate: asBoolean(body.certificate, false),
    status,
  }
}

export function parseCourseUpdateInput(body: Record<string, unknown>): Partial<Course> {
  const data: Partial<Course> = {}

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.slug === 'string') data.slug = body.slug
  if (typeof body.description === 'string') data.description = body.description

  if (body.difficultyLevel === 'beginner' || body.difficultyLevel === 'intermediate' || body.difficultyLevel === 'advanced') {
    data.difficultyLevel = body.difficultyLevel
  }

  if (body.visibility === 'public' || body.visibility === 'private') {
    data.visibility = body.visibility
  }

  if (typeof body.featuredImage === 'string') data.featuredImage = body.featuredImage

  if (body.pricingModel === 'free' || body.pricingModel === 'paid') {
    data.pricingModel = body.pricingModel
  }

  if (Array.isArray(body.categories)) {
    data.categories = asStringArray(body.categories)
  }

  if (Array.isArray(body.tags)) {
    data.tags = asStringArray(body.tags)
  }

  if (typeof body.author === 'string') data.author = body.author
  if (typeof body.isScheduled === 'boolean') data.isScheduled = body.isScheduled
  if (typeof body.scheduleDate === 'string') data.scheduleDate = body.scheduleDate
  if (typeof body.isPublicCourse === 'boolean') data.isPublicCourse = body.isPublicCourse
  if (typeof body.maxStudents === 'number' && !Number.isNaN(body.maxStudents)) data.maxStudents = body.maxStudents
  if (typeof body.certificate === 'boolean') data.certificate = body.certificate

  if (body.status === 'draft' || body.status === 'published') {
    data.status = body.status
  }

  return data
}

export function parseTopicCreateInput(
  body: Record<string, unknown>,
  fallbackOrder: number,
  courseId: string
): TopicInput {
  const title = asTrimmedString(body.title)
  if (!title) {
    badRequest('title is required')
  }

  return {
    courseId,
    title,
    order: typeof body.order === 'number' && !Number.isNaN(body.order) ? body.order : fallbackOrder,
  }
}

export function parseTopicUpdateInput(body: Record<string, unknown>): Partial<Topic> {
  const data: Partial<Topic> = {}

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.order === 'number' && !Number.isNaN(body.order)) data.order = body.order

  return data
}

export function parseLessonCreateInput(
  body: Record<string, unknown>,
  defaults: { topicId: string; courseId: string; order: number }
): LessonInput {
  const title = asTrimmedString(body.title)
  if (!title) {
    badRequest('title is required')
  }

  const previewType: Lesson['previewType'] = body.previewType === 'pro' ? 'pro' : 'free'

  return {
    topicId: defaults.topicId,
    courseId: defaults.courseId,
    title,
    slug: asTrimmedString(body.slug) || generateSlug(title),
    content: asString(body.content),
    featuredImage: asString(body.featuredImage),
    videoUrl: asString(body.videoUrl),
    videoPlaybackHours: asNumber(body.videoPlaybackHours, 0),
    videoPlaybackMinutes: asNumber(body.videoPlaybackMinutes, 0),
    videoPlaybackSeconds: asNumber(body.videoPlaybackSeconds, 0),
    exerciseFiles: asStringArray(body.exerciseFiles),
    isPreview: asBoolean(body.isPreview, false),
    previewType,
    order: typeof body.order === 'number' && !Number.isNaN(body.order) ? body.order : defaults.order,
  }
}

export function parseLessonUpdateInput(body: Record<string, unknown>): Partial<Lesson> {
  const data: Partial<Lesson> = {}

  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.slug === 'string') data.slug = body.slug
  if (typeof body.content === 'string') data.content = body.content
  if (typeof body.featuredImage === 'string') data.featuredImage = body.featuredImage
  if (typeof body.videoUrl === 'string') data.videoUrl = body.videoUrl

  if (typeof body.videoPlaybackHours === 'number' && !Number.isNaN(body.videoPlaybackHours)) {
    data.videoPlaybackHours = body.videoPlaybackHours
  }
  if (typeof body.videoPlaybackMinutes === 'number' && !Number.isNaN(body.videoPlaybackMinutes)) {
    data.videoPlaybackMinutes = body.videoPlaybackMinutes
  }
  if (typeof body.videoPlaybackSeconds === 'number' && !Number.isNaN(body.videoPlaybackSeconds)) {
    data.videoPlaybackSeconds = body.videoPlaybackSeconds
  }

  if (Array.isArray(body.exerciseFiles)) {
    data.exerciseFiles = asStringArray(body.exerciseFiles)
  }

  if (typeof body.isPreview === 'boolean') data.isPreview = body.isPreview
  if (body.previewType === 'free' || body.previewType === 'pro') data.previewType = body.previewType
  if (typeof body.order === 'number' && !Number.isNaN(body.order)) data.order = body.order

  return data
}
