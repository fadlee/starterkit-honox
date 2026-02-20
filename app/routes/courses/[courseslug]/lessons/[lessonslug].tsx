import { createRoute } from 'honox/factory'

import CoursePlayerPage from '@/islands/lms/pages/course-player-page'

export default createRoute((c) => {
  const courseslug = c.req.param('courseslug')
  const lessonslug = c.req.param('lessonslug')
  if (!courseslug || !lessonslug) {
    return c.redirect('/')
  }
  return c.render(<CoursePlayerPage courseslug={courseslug} lessonslug={lessonslug} />)
})
