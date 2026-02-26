import { useEffect, useState } from 'hono/jsx'

import { BookOpen, LogIn, UserPlus } from '@/components/lms/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/toast'
import { go, replace } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

type AuthTab = 'login' | 'register'

export default function LoginPage() {
  const { user, loading, login, register, refresh } = useAuth()
  const [tab, setTab] = useState<AuthTab>('login')

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', displayName: '' })

  useEffect(() => {
    if (loading) return
    if (user) {
      replace('/')
    }
  }, [loading, user])

  const handleLogin = async () => {
    const nextUser = await login(loginForm.username, loginForm.password)

    if (nextUser) {
      await refresh()
      toast({ title: `Selamat datang, ${nextUser.displayName}!`, variant: 'success' })
      go('/')
    } else {
      toast({ title: 'Nama pengguna atau kata sandi salah', variant: 'error' })
    }
  }

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.password || !registerForm.displayName) {
      toast({ title: 'Semua kolom wajib diisi', variant: 'error' })
      return
    }

    const nextUser = await register(registerForm)

    if (nextUser) {
      await refresh()
      toast({ title: `Akun berhasil dibuat! Selamat datang, ${nextUser.displayName}`, variant: 'success' })
      go('/')
    } else {
      toast({ title: 'Nama pengguna sudah digunakan', variant: 'error' })
    }
  }

  return (
    <div class='flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4'>
      <div class='w-full max-w-md space-y-6'>
        <div class='space-y-2 text-center'>
          <div class='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black'>
            <BookOpen class='h-6 w-6 text-white' />
          </div>
          <h1 class='text-2xl font-bold'>LMS Course Builder</h1>
          <p class='text-sm text-[hsl(var(--muted-foreground))]'>Masuk atau daftar untuk melanjutkan</p>
        </div>

        <Card>
          <CardContent class='space-y-4 p-6'>
            <div class='grid w-full grid-cols-2 gap-2'>
              <Button variant={tab === 'login' ? 'default' : 'secondary'} onClick={() => setTab('login')}>
                Masuk
              </Button>
              <Button
                variant={tab === 'register' ? 'default' : 'secondary'}
                onClick={() => setTab('register')}
              >
                Daftar
              </Button>
            </div>

            {tab === 'login' ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleLogin()
                }}
                class='space-y-4'
              >
                <div class='space-y-2'>
                  <Label htmlFor='login-username'>Nama Pengguna</Label>
                  <Input
                    id='login-username'
                    placeholder='Masukkan nama pengguna'
                    value={loginForm.username}
                    onInput={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        username: (event.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </div>
                <div class='space-y-2'>
                  <Label htmlFor='login-password'>Kata Sandi</Label>
                  <Input
                    id='login-password'
                    type='password'
                    placeholder='Masukkan password'
                    value={loginForm.password}
                    onInput={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: (event.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </div>
                <Button type='submit' class='w-full gap-2'>
                  <LogIn class='h-4 w-4' /> Masuk
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleRegister()
                }}
                class='space-y-4'
              >
                <div class='space-y-2'>
                  <Label htmlFor='reg-name'>Nama Lengkap</Label>
                  <Input
                    id='reg-name'
                    placeholder='Nama tampilan'
                    value={registerForm.displayName}
                    onInput={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        displayName: (event.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </div>
                <div class='space-y-2'>
                  <Label htmlFor='reg-username'>Nama Pengguna</Label>
                  <Input
                    id='reg-username'
                    placeholder='Pilih nama pengguna'
                    value={registerForm.username}
                    onInput={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        username: (event.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </div>
                <div class='space-y-2'>
                  <Label htmlFor='reg-password'>Kata Sandi</Label>
                  <Input
                    id='reg-password'
                    type='password'
                    placeholder='Buat password'
                    value={registerForm.password}
                    onInput={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        password: (event.target as HTMLInputElement).value,
                      }))
                    }
                  />
                </div>
                <Button type='submit' class='w-full gap-2'>
                  <UserPlus class='h-4 w-4' /> Daftar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
