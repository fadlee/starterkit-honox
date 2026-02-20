import { createRoute } from 'honox/factory'

import { getCourseBySlug } from '@/lib/server/lms-store'
import { handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)

    const slug = c.req.param('courseslug')
    if (!slug) {
      notFound('course not found')
    }

    const course = await getCourseBySlug(c.env.LMS_DB, slug)
    if (!course) {
      notFound('course not found')
    }

    return c.json(course, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
