import { createRoute } from 'honox/factory'

import { requireAuth } from '@/lib/server/api-auth'
import { getCourseById, getCourseProgress } from '@/lib/server/lms-store'
import { handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    const user = requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    return c.json({ progress: getCourseProgress(user.id, courseId) }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
