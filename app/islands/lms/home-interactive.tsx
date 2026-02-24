import { useMemo, useState } from 'hono/jsx'

import { BookOpen, LogOut, Plus, Search, Settings } from '@/components/lms/icons'
import { CourseCard } from '@/components/lms/course-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deleteCourse, getSiteSettings, updateSiteSettings, type SiteSettings } from '@/lib/lms-storage'
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

type SettingsProps = {
    action: 'settings'
    initialSettings: SiteSettings
}

type HomeInteractiveProps = LogoutProps | CourseListProps | SettingsProps

export default function HomeInteractive(props: HomeInteractiveProps) {
    if (props.action === 'logout') {
        return <LogoutButton />
    }

    if (props.action === 'settings') {
        return <SettingsButton initialSettings={props.initialSettings} />
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

function SettingsButton({ initialSettings }: { initialSettings: SiteSettings }) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<SiteSettings>(initialSettings)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateSiteSettings(form)
            toast({ title: 'Pengaturan berhasil disimpan', variant: 'success' })
            setOpen(false)
            window.location.reload()
        } catch {
            toast({ title: 'Gagal menyimpan pengaturan', variant: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Button variant='outline' size='sm' onClick={() => setOpen(true)} class='gap-1.5'>
                <Settings class='h-4 w-4' /> Pengaturan
            </Button>

            {open && (
                <div
                    class='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center'
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false)
                    }}
                >
                    <div class='my-6 w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-white p-6 shadow-lg max-h-[calc(100vh-3rem)] overflow-y-auto'>
                        <div class='mb-4 flex items-center justify-between'>
                            <div>
                                <h2 class='text-lg font-semibold'>Pengaturan Website</h2>
                                <p class='text-sm text-[hsl(var(--muted-foreground))]'>Atur nama dan ikon website</p>
                            </div>
                            <Button variant='ghost' size='icon' onClick={() => setOpen(false)}>
                                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' class='h-4 w-4'><path d='M18 6 6 18M6 6l12 12' /></svg>
                            </Button>
                        </div>

                        <div class='space-y-4'>
                            <div class='space-y-2'>
                                <Label htmlFor='site-name'>Nama Website</Label>
                                <Input
                                    id='site-name'
                                    placeholder='LMS Course Builder'
                                    value={form.siteName}
                                    onInput={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            siteName: (e.target as HTMLInputElement).value,
                                        }))
                                    }
                                />
                            </div>

                            <div class='space-y-2'>
                                <Label htmlFor='site-icon'>URL Ikon Website</Label>
                                <Input
                                    id='site-icon'
                                    placeholder='https://example.com/icon.png'
                                    value={form.siteIcon}
                                    onInput={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            siteIcon: (e.target as HTMLInputElement).value,
                                        }))
                                    }
                                />
                                {form.siteIcon && (
                                    <div class='flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]'>
                                        <img
                                            src={form.siteIcon}
                                            alt='preview'
                                            class='h-8 w-8 rounded object-cover'
                                            onError={(e: Event) => {
                                                ;(e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                        <span>Preview ikon</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div class='mt-6 flex gap-2'>
                            <Button class='flex-1' onClick={() => void handleSave()} disabled={saving}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button variant='outline' class='flex-1' onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
