import { createRoute } from 'honox/factory'

import { setSessionCookie } from '@/lib/server/api-auth'
import {
  authenticateUser,
} from '@/lib/server/lms-store'
import {
  handleApiError,
  readJsonBody,
  requireString,
  setNoStore,
  unauthorized,
} from '@/lib/server/api-utils'

type LoginBody = {
  username?: unknown
  password?: unknown
}

export const POST = createRoute(async (c) => {
  try {
    setNoStore(c)

    const body = await readJsonBody<LoginBody>(c)
    const username = requireString(body.username, 'username')
    const password = requireString(body.password, 'password')

    const user = await authenticateUser(c.env.LMS_DB, username, password)
    if (!user) {
      unauthorized('username or password is invalid')
    }

    await setSessionCookie(c, user.id)
    return c.json(user, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
