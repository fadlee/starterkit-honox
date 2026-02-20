import { createRoute } from 'honox/factory'

import { getCourseById, getLessonBySlug } from '@/lib/server/lms-store'
import { handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)

    const courseId = c.req.param('courseId')
    const lessonSlug = c.req.param('lessonslug')
    if (!courseId || !lessonSlug) {
      notFound('lesson not found')
    }

    const course = await getCourseById(c.env.LMS_DB, courseId)
    if (!course) {
      notFound('course not found')
    }

    const lesson = await getLessonBySlug(c.env.LMS_DB, courseId, lessonSlug)
    if (!lesson) {
      notFound('lesson not found')
    }

    return c.json(lesson, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})
