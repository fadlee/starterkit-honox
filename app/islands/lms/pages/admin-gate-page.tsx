import { useEffect } from 'hono/jsx'

import { getCurrentUser } from '@/lib/auth-storage'
import { replace } from '@/islands/lms/hooks/navigation'

export default function AdminGatePage() {
  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      replace('/login')
      return
    }

    if (user.role !== 'admin') {
      replace('/')
      return
    }

    replace('/admin/courses/new')
  }, [])

  return <div class='p-6 text-sm text-[hsl(var(--muted-foreground))]'>Redirecting...</div>
}
