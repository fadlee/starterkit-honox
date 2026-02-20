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

    const topic = await getTopicById(c.env.LMS_DB, topicId)
    if (!topic) {
      notFound('topic not found')
    }

    return c.json(await listLessonsByTopic(c.env.LMS_DB, topicId), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const topicId = c.req.param('topicId')
    if (!topicId) {
      notFound('topic not found')
    }

    const topic = await getTopicById(c.env.LMS_DB, topicId)
    if (!topic) {
      notFound('topic not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const input = parseLessonCreateInput(body, {
      topicId,
      courseId: topic.courseId,
      order: (await listLessonsByTopic(c.env.LMS_DB, topicId)).length,
    })

    const created = await createLesson(c.env.LMS_DB, input)
    return c.json(created, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})
