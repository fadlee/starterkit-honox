import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { updateUserRole } from '@/lib/server/lms-store'
import {
  badRequest,
  handleApiError,
  notFound,
  readJsonBody,
  setNoStore,
} from '@/lib/server/api-utils'

type Body = {
  role?: unknown
}

export const PATCH = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('user not found')
    }

    const body = await readJsonBody<Body>(c)
    const role = body.role
    if (role !== 'admin' && role !== 'user') {
      badRequest('role must be admin or user')
    }

    const updated = await updateUserRole(c.env.LMS_DB, id, role)
    if (!updated) {
      notFound('user not found')
    }

    return c.json(updated, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
