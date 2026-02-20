import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { getTopicById, reorderLessons } from '@/lib/server/lms-store'
import {
  badRequest,
  handleApiError,
  notFound,
  readJsonBody,
  requireStringArray,
  setNoStore,
} from '@/lib/server/api-utils'

type Body = {
  orderedIds?: unknown
}

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

    const body = await readJsonBody<Body>(c)
    const orderedIds = requireStringArray(body.orderedIds, 'orderedIds')

    const ok = await reorderLessons(c.env.LMS_DB, topicId, orderedIds)
    if (!ok) {
      badRequest('orderedIds is invalid')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
