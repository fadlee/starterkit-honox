import { createRoute } from 'honox/factory'

import { requireAuth } from '@/lib/server/api-auth'
import {
  enrollCourse,
  getCourseById,
  getEnrollment,
  unenrollCourse,
} from '@/lib/server/lms-store'
import { handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    const user = await requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    return c.json(await getEnrollment(c.env.LMS_DB, user.id, courseId), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    const user = await requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    const enrollment = await enrollCourse(c.env.LMS_DB, user.id, courseId)
    return c.json(enrollment, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const DELETE = createRoute(async (c) => {
  try {
    const user = await requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    if (!courseId) {
      notFound('course not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    await unenrollCourse(c.env.LMS_DB, user.id, courseId)
    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
