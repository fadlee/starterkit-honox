import { createRoute } from 'honox/factory'

import { requireAuth } from '@/lib/server/api-auth'
import {
  getCourseById,
  getCourseProgress,
  getLessonById,
  toggleLessonComplete,
} from '@/lib/server/lms-store'
import { badRequest, handleApiError, notFound, setNoStore } from '@/lib/server/api-utils'

export const POST = createRoute(async (c) => {
  try {
    const user = requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    const lessonId = c.req.param('lessonId')
    if (!courseId || !lessonId) {
      notFound('lesson not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    const lesson = getLessonById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      notFound('lesson not found')
    }

    const completed = toggleLessonComplete(user.id, courseId, lessonId)
    if (completed === null) {
      badRequest('please enroll in this course first')
    }

    return c.json(
      {
        completed,
        progress: getCourseProgress(user.id, courseId),
      },
      200
    )
  } catch (error) {
    return handleApiError(c, error)
  }
})
