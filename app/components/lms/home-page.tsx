import { BookOpen, Plus, Settings, Shield, Users } from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRoleLabel } from '@/lib/lms-labels'
import type { Course, User } from '@/types/lms'
import type { SiteSettings } from '@/lib/server/lms-store'
import { CourseCard } from '@/components/lms/course-card'
import HomeInteractive from '@/islands/lms/home-interactive'

interface HomePageProps {
    courses: Course[]
    user: User | null
    siteSettings: SiteSettings
}

export function HomePage({ courses, user, siteSettings }: HomePageProps) {
    const isAdmin = user?.role === 'admin'
    const displayName = siteSettings.siteName || 'LMS Course Builder'

    return (
        <div class='min-h-screen bg-[hsl(var(--background))]'>
            <header class='z-50 w-full border-b border-[hsl(var(--border))] bg-white/95'>
                <div class='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
                    <div class='flex items-center gap-3'>
                        {siteSettings.siteIcon ? (
                            <img
                                src={siteSettings.siteIcon}
                                alt={displayName}
                                class='h-9 w-9 rounded-lg object-cover'
                            />
                        ) : (
                            <div class='flex h-9 w-9 items-center justify-center rounded-lg bg-black'>
                                <BookOpen class='h-5 w-5 text-white' />
                            </div>
                        )}
                        <h1 class='text-xl font-bold'>{displayName}</h1>
                    </div>

                    <div class='flex items-center gap-3'>
                        <div class='flex items-center gap-2 text-sm'>
                            <span class='text-[hsl(var(--muted-foreground))]'>Halo,</span>
                            <span class='font-medium'>{user ? user.displayName : 'Tamu'}</span>
                            {user && (
                                <Badge variant={isAdmin ? 'default' : 'secondary'} class='gap-1 text-xs'>
                                    {isAdmin && <Shield class='h-3 w-3' />} {getRoleLabel(user.role)}
                                </Badge>
                            )}
                        </div>

                        {isAdmin && (
                            <HomeInteractive action='settings' initialSettings={siteSettings} />
                        )}

                        {isAdmin && (
                            <a href='/admin/users'>
                                <Button variant='outline' size='sm' class='gap-1.5'>
                                    <Users class='h-4 w-4' /> Pengguna
                                </Button>
                            </a>
                        )}

                        {isAdmin && (
                            <a href='/admin/courses/new'>
                                <Button size='sm' class='gap-1.5'>
                                    <Plus class='h-4 w-4' /> Kursus Baru
                                </Button>
                            </a>
                        )}

                        {user ? (
                            <HomeInteractive action='logout' />
                        ) : (
                            <a href='/login'>
                                <Button variant='default' size='sm' class='gap-1.5'>
                                    Masuk
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main class='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
                <div class='mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 sm:p-12 text-center shadow-sm border border-blue-100/50 relative'>
                    <div class='absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl'></div>
                    <div class='absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 blur-3xl'></div>
                    <div class='relative z-10'>
                        <h2 class='mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl'>
                            Selamat Datang{user ? `, ${user.displayName}` : ''}!
                        </h2>
                        <p class='mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl'>
                            Jelajahi berbagai kursus menarik yang kami sediakan untuk meningkatkan pengetahuan dan kemampuan Anda.
                        </p>
                    </div>
                </div>

                <HomeInteractive action='course-list' courses={courses} isAdmin={isAdmin} />
            </main>
        </div>
    )
}
