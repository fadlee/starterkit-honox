import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { listUsers } from '@/lib/server/lms-store'
import { handleApiError, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)
    return c.json(listUsers(), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
