import { createRoute } from 'honox/factory'

import { clearSessionCookie } from '@/lib/server/api-auth'
import { handleApiError, setNoStore } from '@/lib/server/api-utils'

export const POST = createRoute(async (c) => {
  try {
    setNoStore(c)
    clearSessionCookie(c)
    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
