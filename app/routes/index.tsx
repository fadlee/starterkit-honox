import { createRoute } from 'honox/factory'

import DashboardPage from '@/islands/lms/pages/dashboard-page'

export default createRoute((c) => {
  return c.render(<DashboardPage />)
})
