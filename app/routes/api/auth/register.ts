import { createRoute } from 'honox/factory'

import { setSessionCookie } from '@/lib/server/api-auth'
import { createUser } from '@/lib/server/lms-store'
import {
  conflict,
  handleApiError,
  readJsonBody,
  requireString,
  setNoStore,
} from '@/lib/server/api-utils'

type RegisterBody = {
  username?: unknown
  password?: unknown
  displayName?: unknown
}

export const POST = createRoute(async (c) => {
  try {
    setNoStore(c)

    const body = await readJsonBody<RegisterBody>(c)
    const username = requireString(body.username, 'username')
    const password = requireString(body.password, 'password')
    const displayName = requireString(body.displayName, 'displayName')

    const user = createUser({ username, password, displayName })
    if (!user) {
      conflict('username already used')
    }

    setSessionCookie(c, user.id)
    return c.json(user, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})
