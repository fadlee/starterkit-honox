import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseTopicUpdateInput } from '@/lib/server/lms-payloads'
import { deleteTopic, updateTopic } from '@/lib/server/lms-store'
import { handleApiError, notFound, readJsonBody, setNoStore } from '@/lib/server/api-utils'

export const PATCH = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('topic not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const data = parseTopicUpdateInput(body)
    const updated = updateTopic(id, data)

    if (!updated) {
      notFound('topic not found')
    }

    return c.json(updated, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const DELETE = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('topic not found')
    }

    const deleted = deleteTopic(id)
    if (!deleted) {
      notFound('topic not found')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
