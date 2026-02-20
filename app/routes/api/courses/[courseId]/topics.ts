import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseTopicCreateInput } from '@/lib/server/lms-payloads'
import {
  createTopic,
  getCourseById,
  listTopicsByCourse,
} from '@/lib/server/lms-store'
import {
  handleApiError,
  notFound,
  readJsonBody,
  setNoStore,
} from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    return c.json(listTopicsByCourse(courseId), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const currentTopics = listTopicsByCourse(courseId)
    const input = parseTopicCreateInput(body, currentTopics.length, courseId)

    const topic = createTopic(input)
    return c.json(topic, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})
