import { useEffect, useState } from 'hono/jsx'

import type { User } from '@/types/lms'
import { deleteUser, getUsers, updateUserRole } from '@/lib/auth-storage'
import { toast } from '@/lib/toast'
import { ArrowLeft, Shield, Trash2, Users } from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { go, replace } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

export default function UserManagementPage() {
  const { user: currentUser, isAdmin, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])

  const refresh = () => setUsers(getUsers())

  useEffect(() => {
    if (loading) return
    if (!currentUser) {
      replace('/login')
      return
    }
    if (!isAdmin) {
      replace('/')
      return
    }
    refresh()
  }, [currentUser, isAdmin, loading])

  const handleRoleChange = (id: string, role: 'admin' | 'user') => {
    updateUserRole(id, role)
    refresh()
    toast({ title: 'Role berhasil diubah', variant: 'success' })
  }

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      toast({ title: 'Tidak bisa menghapus akun sendiri', variant: 'error' })
      return
    }

    deleteUser(id)
    refresh()
    toast({ title: 'User berhasil dihapus', variant: 'success' })
  }

  if (loading) return null

  return (
    <div class='min-h-screen bg-[hsl(var(--background))]'>
      <header class='border-b border-[hsl(var(--border))] bg-white'>
        <div class='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
          <div class='flex items-center gap-3'>
            <Button variant='ghost' size='icon' onClick={() => go('/')}>
              <ArrowLeft class='h-5 w-5' />
            </Button>
            <div class='flex h-9 w-9 items-center justify-center rounded-lg bg-black'>
              <Users class='h-5 w-5 text-white' />
            </div>
            <h1 class='text-xl font-bold'>User Management</h1>
          </div>
          <Badge variant='secondary' class='gap-1'>
            <Shield class='h-3 w-3' /> {users.length} users
          </Badge>
        </div>
      </header>

      <main class='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div class='overflow-hidden rounded-lg border border-[hsl(var(--border))]'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead class='text-right'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell class='font-medium'>{user.username}</TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(user.id, (event.target as HTMLSelectElement).value as 'admin' | 'user')
                      }
                      class='h-8 w-[120px] rounded-md border border-[hsl(var(--border))] bg-transparent px-2 text-sm'
                    >
                      <option value='admin'>Admin</option>
                      <option value='user'>User</option>
                    </select>
                  </TableCell>
                  <TableCell class='text-sm text-[hsl(var(--muted-foreground))]'>
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell class='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === currentUser?.id}
                      class='text-red-600 hover:text-red-600'
                    >
                      <Trash2 class='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
