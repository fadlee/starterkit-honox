import { createRoute } from 'honox/factory'

import CourseDetailPage from '@/islands/lms/pages/course-detail-page'

export default createRoute((c) => {
  const courseslug = c.req.param('courseslug')
  if (!courseslug) {
    return c.redirect('/')
  }
  return c.render(<CourseDetailPage courseslug={courseslug} />)
})
