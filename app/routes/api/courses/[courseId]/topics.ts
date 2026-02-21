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

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    return c.json(await listTopicsByCourse(c.env.LMS_DB, courseId), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const currentTopics = await listTopicsByCourse(c.env.LMS_DB, courseId)
    const nextOrder = currentTopics.reduce((maxOrder, topic) => Math.max(maxOrder, topic.order), -1) + 1
    const input = parseTopicCreateInput(body, nextOrder, courseId)

    const topic = await createTopic(c.env.LMS_DB, input)
    return c.json(topic, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})
