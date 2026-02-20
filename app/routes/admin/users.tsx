import { createRoute } from 'honox/factory'

import UserManagementPage from '@/islands/lms/pages/user-management-page'

export default createRoute((c) => {
  return c.render(<UserManagementPage />)
})
