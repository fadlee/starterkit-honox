import { createRoute } from 'honox/factory'

import AdminGatePage from '@/islands/lms/pages/admin-gate-page'

export default createRoute((c) => {
  return c.render(<AdminGatePage />)
})
