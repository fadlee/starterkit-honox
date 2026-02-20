import { createRoute } from 'honox/factory'

import CourseBuilderPage from '@/islands/lms/pages/course-builder-page'

export default createRoute((c) => {
  const id = c.req.param('id')
  return c.render(<CourseBuilderPage id={id} />)
})
