import { createRoute } from 'honox/factory'

import CourseBuilderPage from '@/islands/lms/pages/course-builder-page'

export default createRoute((c) => {
  return c.render(<CourseBuilderPage id='new' />)
})
