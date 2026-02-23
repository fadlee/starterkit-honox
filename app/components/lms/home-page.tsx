import { BookOpen, Plus, Shield, Users } from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRoleLabel } from '@/lib/lms-labels'
import type { Course, User } from '@/types/lms'
import { CourseCard } from '@/components/lms/course-card'
import HomeInteractive from '@/islands/lms/home-interactive'

interface HomePageProps {
    courses: Course[]
    user: User | null
}

export function HomePage({ courses, user }: HomePageProps) {
    const isAdmin = user?.role === 'admin'

    return (
        <div class='min-h-screen bg-[hsl(var(--background))]'>
            <header class='border-b border-[hsl(var(--border))] bg-white'>
                <div class='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
                    <div class='flex items-center gap-3'>
                        <div class='flex h-9 w-9 items-center justify-center rounded-lg bg-black'>
                            <BookOpen class='h-5 w-5 text-white' />
                        </div>
                        <h1 class='text-xl font-bold'>LMS Course Builder</h1>
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
                <HomeInteractive action='course-list' courses={courses} isAdmin={isAdmin} />
            </main>
        </div>
    )
}
