import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseLessonUpdateInput } from '@/lib/server/lms-payloads'
import { deleteLesson, updateLesson } from '@/lib/server/lms-store'
import { handleApiError, notFound, readJsonBody, setNoStore } from '@/lib/server/api-utils'

export const PATCH = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('lesson not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const data = parseLessonUpdateInput(body)

    const updated = await updateLesson(c.env.LMS_DB, id, data)
    if (!updated) {
      notFound('lesson not found')
    }

    return c.json(updated, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const DELETE = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('lesson not found')
    }

    const deleted = await deleteLesson(c.env.LMS_DB, id)
    if (!deleted) {
      notFound('lesson not found')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
