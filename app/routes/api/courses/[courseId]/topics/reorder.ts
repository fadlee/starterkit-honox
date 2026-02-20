import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { getCourseById, reorderTopics } from '@/lib/server/lms-store'
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

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    const body = await readJsonBody<Body>(c)
    const orderedIds = requireStringArray(body.orderedIds, 'orderedIds')

    const ok = await reorderTopics(c.env.LMS_DB, courseId, orderedIds)
    if (!ok) {
      badRequest('orderedIds is invalid')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
