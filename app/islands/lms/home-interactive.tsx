import { useMemo, useState } from 'hono/jsx'

import { BookOpen, LogOut, Plus, Search } from '@/components/lms/icons'
import { CourseCard } from '@/components/lms/course-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteCourse } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import type { Course } from '@/types/lms'
import { go } from '@/islands/lms/hooks/navigation'

type LogoutProps = {
    action: 'logout'
}

type CourseListProps = {
    action: 'course-list'
    courses: Course[]
    isAdmin: boolean
}

type HomeInteractiveProps = LogoutProps | CourseListProps

export default function HomeInteractive(props: HomeInteractiveProps) {
    if (props.action === 'logout') {
        return <LogoutButton />
    }

    return <CourseList courses={props.courses} isAdmin={props.isAdmin} />
}

function LogoutButton() {
    const handleLogout = async () => {
        try {
            const { logout } = await import('@/lib/auth-storage')
            await logout()
            go('/login')
        } catch {
            go('/login')
        }
    }

    return (
        <Button
            variant='ghost'
            size='sm'
            onClick={() => void handleLogout()}
            class='gap-1.5 text-[hsl(var(--muted-foreground))]'
        >
            <LogOut class='h-4 w-4' /> Keluar
        </Button>
    )
}

function CourseList({ courses: initialCourses, isAdmin }: { courses: Course[]; isAdmin: boolean }) {
    const [courses, setCourses] = useState(initialCourses)
    const [search, setSearch] = useState('')

    const filteredCourses = useMemo(
        () =>
            courses.filter((course) =>
                course.title.toLowerCase().includes(search.toLowerCase())
            ),
        [courses, search]
    )

    const handleDelete = async (id: string) => {
        await deleteCourse(id)
        setCourses((prev) => prev.filter((c) => c.id !== id))
        toast({ title: 'Kursus berhasil dihapus', variant: 'success' })
    }

    return (
        <>
            <div class='mb-6'>
                <div class='relative'>
                    <Search class='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]' />
                    <Input
                        placeholder='Cari kursus...'
                        value={search}
                        onInput={(event) => setSearch((event.target as HTMLInputElement).value)}
                        class='pl-9'
                    />
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div class='py-20 text-center'>
                    <BookOpen class='mx-auto mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))]/40' />
                    <h2 class='mb-2 text-lg font-semibold'>Belum ada kursus</h2>
                    <p class='mb-4 text-[hsl(var(--muted-foreground))]'>
                        {isAdmin ? 'Buat kursus pertamamu untuk memulai' : 'Belum ada kursus yang tersedia'}
                    </p>
                    {isAdmin && (
                        <Button onClick={() => go('/admin/courses/new')} class='gap-2'>
                            <Plus class='h-4 w-4' /> Buat Kursus Baru
                        </Button>
                    )}
                </div>
            ) : (
                <div class='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEdit={isAdmin ? (id) => go(`/admin/courses/${id}`) : undefined}
                            onDelete={isAdmin ? (id) => void handleDelete(id) : undefined}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
