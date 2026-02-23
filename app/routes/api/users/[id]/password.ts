import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { updateUserPassword } from '@/lib/server/lms-store'
import { badRequest, handleApiError, notFound, readJsonBody, requireString, setNoStore } from '@/lib/server/api-utils'

export const PATCH = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('user not found')
    }

    const body = await readJsonBody<{ newPassword?: unknown }>(c)
    const newPassword = requireString(body.newPassword, 'newPassword')

    if (newPassword.length < 6) {
      badRequest('password must be at least 6 characters')
    }

    const updated = await updateUserPassword(c.env.LMS_DB, id, newPassword)
    if (!updated) {
      notFound('user not found')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
