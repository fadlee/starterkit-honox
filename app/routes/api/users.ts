import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { listUsers } from '@/lib/server/lms-store'
import { handleApiError, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)
    return c.json(await listUsers(c.env.LMS_DB), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
