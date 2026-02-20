import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { deleteUser } from '@/lib/server/lms-store'
import { badRequest, handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export const DELETE = createRoute(async (c) => {
  try {
    const currentUser = requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('user not found')
    }

    if (id === currentUser.id) {
      badRequest('cannot delete your own account')
    }

    const deleted = deleteUser(id)
    if (!deleted) {
      notFound('user not found')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
