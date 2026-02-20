import { useEffect } from 'hono/jsx'

import { getCurrentUser } from '@/lib/auth-storage'
import { replace } from '@/islands/lms/hooks/navigation'

export default function AdminGatePage() {
  useEffect(() => {
    const check = async () => {
      const user = await getCurrentUser()

      if (!user) {
        replace('/login')
        return
      }

      if (user.role !== 'admin') {
        replace('/')
        return
      }

      replace('/admin/courses/new')
    }

    void check()
  }, [])

  return <div class='p-6 text-sm text-[hsl(var(--muted-foreground))]'>Redirecting...</div>
}
