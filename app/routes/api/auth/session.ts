import { createRoute } from 'honox/factory'

import { getSessionUser } from '@/lib/server/api-auth'
import { handleApiError, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)
    const user = getSessionUser(c)
    return c.json(user, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
