import { useEffect, useState } from 'hono/jsx'

import type { User } from '@/types/lms'
import { changePassword, deleteUser, getUsers, updateUserRole } from '@/lib/auth-storage'
import { toast } from '@/lib/toast'
import { ArrowLeft, KeyRound, Shield, Trash2, Users } from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { go, replace } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

export default function UserManagementPage() {
  const { user: currentUser, isAdmin, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [passwordModal, setPasswordModal] = useState<{ userId: string; username: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const refresh = async () => setUsers(await getUsers())

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
    void refresh()
  }, [currentUser, isAdmin, loading])

  const handleRoleChange = async (id: string, role: 'admin' | 'user') => {
    await updateUserRole(id, role)
    await refresh()
    toast({ title: 'Role berhasil diubah', variant: 'success' })
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast({ title: 'Tidak bisa menghapus akun sendiri', variant: 'error' })
      return
    }

    await deleteUser(id)
    await refresh()
    toast({ title: 'User berhasil dihapus', variant: 'success' })
  }

  const openPasswordModal = (user: User) => {
    setPasswordModal({ userId: user.id, username: user.username })
    setNewPassword('')
    setConfirmPassword('')
  }

  const closePasswordModal = () => {
    setPasswordModal(null)
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleChangePassword = async () => {
    if (!passwordModal) return
    if (newPassword.length < 6) {
      toast({ title: 'Password minimal 6 karakter', variant: 'error' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Konfirmasi password tidak cocok', variant: 'error' })
      return
    }
    setSavingPassword(true)
    try {
      await changePassword(passwordModal.userId, newPassword)
      toast({ title: `Password ${passwordModal.username} berhasil diubah`, variant: 'success' })
      closePasswordModal()
    } catch {
      toast({ title: 'Gagal mengubah password', variant: 'error' })
    } finally {
      setSavingPassword(false)
    }
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
                        void handleRoleChange(
                          user.id,
                          (event.target as HTMLSelectElement).value as 'admin' | 'user'
                        )
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
                    <div class='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openPasswordModal(user)}
                        title='Ubah password'
                      >
                        <KeyRound class='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => void handleDelete(user.id)}
                        disabled={user.id === currentUser?.id}
                        class='text-red-600 hover:text-red-600'
                        title='Hapus user'
                      >
                        <Trash2 class='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {passwordModal && (
        <div
          class='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={(e) => {
            if (e.target === e.currentTarget) closePasswordModal()
          }}
        >
          <div class='w-full max-w-sm rounded-lg border border-[hsl(var(--border))] bg-white p-6 shadow-lg'>
            <h2 class='mb-1 text-lg font-semibold'>Ubah Password</h2>
            <p class='mb-4 text-sm text-[hsl(var(--muted-foreground))]'>
              User: <span class='font-medium text-foreground'>{passwordModal.username}</span>
            </p>
            <div class='space-y-2'>
              <Label htmlFor='new-password'>Password Baru</Label>
              <Input
                id='new-password'
                type='password'
                placeholder='Minimal 6 karakter'
                value={newPassword}
                onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if ((e as KeyboardEvent).key === 'Enter') void handleChangePassword()
                }}
              />
            </div>
            <div class='mt-3 space-y-2'>
              <Label htmlFor='confirm-password'>Konfirmasi Password</Label>
              <Input
                id='confirm-password'
                type='password'
                placeholder='Ulangi password baru'
                value={confirmPassword}
                onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if ((e as KeyboardEvent).key === 'Enter') void handleChangePassword()
                }}
              />
            </div>
            <div class='mt-4 flex gap-2'>
              <Button class='flex-1' onClick={() => void handleChangePassword()} disabled={savingPassword}>
                {savingPassword ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant='outline' class='flex-1' onClick={closePasswordModal}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
