import { useEffect, useMemo, useState } from 'hono/jsx'

import { BookOpen, LogOut, Plus, Search, Shield, Users } from '@/components/lms/icons'
import { CourseCard } from '@/components/lms/course-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteCourse, getCourses } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import type { Course } from '@/types/lms'
import { go } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const refreshCourses = () => {
    setCourses(getCourses())
  }

  useEffect(() => {
    refreshCourses()
  }, [])

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase())
        const matchesLevel = levelFilter === 'all' || course.difficultyLevel === levelFilter
        return matchesSearch && matchesLevel
      }),
    [courses, search, levelFilter]
  )

  const handleDelete = (id: string) => {
    deleteCourse(id)
    refreshCourses()
    toast({ title: 'Course deleted', variant: 'success' })
  }

  const handleLogout = () => {
    logout()
    go('/login')
  }

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
              <span class='text-[hsl(var(--muted-foreground))]'>Hi,</span>
              <span class='font-medium'>{user ? user.displayName : 'Guest'}</span>
              {user && (
                <Badge variant={isAdmin ? 'default' : 'secondary'} class='gap-1 text-xs'>
                  {isAdmin && <Shield class='h-3 w-3' />} {user.role}
                </Badge>
              )}
            </div>

            {isAdmin && (
              <Button variant='outline' size='sm' onClick={() => go('/admin/users')} class='gap-1.5'>
                <Users class='h-4 w-4' /> Users
              </Button>
            )}

            {isAdmin && (
              <Button size='sm' onClick={() => go('/admin/courses/new')} class='gap-1.5'>
                <Plus class='h-4 w-4' /> New Course
              </Button>
            )}

            {user ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                class='gap-1.5 text-[hsl(var(--muted-foreground))]'
              >
                <LogOut class='h-4 w-4' /> Logout
              </Button>
            ) : (
              <Button variant='default' size='sm' onClick={() => go('/login')} class='gap-1.5'>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main class='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div class='mb-6 flex flex-col gap-3 sm:flex-row'>
          <div class='relative flex-1'>
            <Search class='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]' />
            <Input
              placeholder='Search courses...'
              value={search}
              onInput={(event) => setSearch((event.target as HTMLInputElement).value)}
              class='pl-9'
            />
          </div>

          <select
            value={levelFilter}
            onChange={(event) => setLevelFilter((event.target as HTMLSelectElement).value)}
            class='h-10 w-[180px] rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 text-sm'
          >
            <option value='all'>All Levels</option>
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
          </select>
        </div>

        {filteredCourses.length === 0 ? (
          <div class='py-20 text-center'>
            <BookOpen class='mx-auto mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))]/40' />
            <h2 class='mb-2 text-lg font-semibold'>No courses yet</h2>
            <p class='mb-4 text-[hsl(var(--muted-foreground))]'>
              {isAdmin ? 'Create your first course to get started' : 'No courses available yet'}
            </p>
            {isAdmin && (
              <Button onClick={() => go('/admin/courses/new')} class='gap-2'>
                <Plus class='h-4 w-4' /> Create New Course
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
                onDelete={isAdmin ? handleDelete : undefined}
              />
            ))}
          </div>
        )}

        <div class='mt-10 border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))]'>
          <p class='mb-2'>Developer demo routes (legacy) tetap tersedia:</p>
          <div class='flex flex-wrap gap-3'>
            <a class='underline' href='/demo/counter'>
              /demo/counter
            </a>
            <a class='underline' href='/demo/clock'>
              /demo/clock
            </a>
            <a class='underline' href='/demo/data/ssr'>
              /demo/data/ssr
            </a>
            <a class='underline' href='/demo/data/spa'>
              /demo/data/spa
            </a>
            <a class='underline' href='/demo/form'>
              /demo/form
            </a>
            <a class='underline' href='/demo/router'>
              /demo/router
            </a>
            <a class='underline' href='/demo/ui'>
              /demo/ui
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
