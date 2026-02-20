import { createRoute } from 'honox/factory'

import LoginPage from '@/islands/lms/pages/login-page'

export default createRoute((c) => {
  return c.render(<LoginPage />)
})
