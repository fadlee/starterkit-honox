import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseLessonCreateInput } from '@/lib/server/lms-payloads'
import {
  createLesson,
  getTopicById,
  listLessonsByTopic,
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

    const topicId = c.req.param('topicId')
    if (!topicId) {
      notFound('topic not found')
    }

    const topic = getTopicById(topicId)
    if (!topic) {
      notFound('topic not found')
    }

    return c.json(listLessonsByTopic(topicId), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const topicId = c.req.param('topicId')
    if (!topicId) {
      notFound('topic not found')
    }

    const topic = getTopicById(topicId)
    if (!topic) {
      notFound('topic not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const input = parseLessonCreateInput(body, {
      topicId,
      courseId: topic.courseId,
      order: listLessonsByTopic(topicId).length,
    })

    const created = createLesson(input)
    return c.json(created, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})
