import { createRoute } from 'honox/factory'

import CoursePlayerPage from '@/islands/lms/pages/course-player-page'
import { stripHtmlAndTruncate } from '@/lib/seo'
import { getCourseBySlug, getLessonBySlug } from '@/lib/server/lms-store'

export default createRoute(async (c) => {
  const courseslug = c.req.param('courseslug')
  const lessonslug = c.req.param('lessonslug')
  if (!courseslug || !lessonslug) {
    return c.redirect('/')
  }

  const course = await getCourseBySlug(c.env.LMS_DB, courseslug)
  if (!course) {
    return c.redirect('/')
  }

  const lesson = await getLessonBySlug(c.env.LMS_DB, course.id, lessonslug)
  const lessonTitle = lesson?.title || 'Pelajaran'
  const descriptionSource = lesson?.content || course.description || ''
  const description =
    stripHtmlAndTruncate(descriptionSource, 160) ||
    `Ikuti pelajaran ${lessonTitle} dari kursus ${course.title}.`

  return c.render(<CoursePlayerPage courseslug={courseslug} lessonslug={lessonslug} />, {
    title: `${lessonTitle} | ${course.title}`,
    description,
    canonicalPath: `/courses/${courseslug}/lessons/${lessonslug}`,
    noindex: false,
    ogImage: lesson?.featuredImage || course.featuredImage || '/favicon.ico',
    ogType: 'article',
  })
})
