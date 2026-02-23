import { useEffect, useMemo, useState } from 'hono/jsx'

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  ImageIcon,
  PlayCircle,
  Share2,
  Video,
} from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getPreviewTypeLabel,
  getStatusLabel,
  getVisibilityLabel,
} from '@/lib/lms-labels'
import { Progress } from '@/components/ui/progress'
import { enrollCourse, getCourseBySlug, getEnrollment, getLessonsByTopic, getTopicsByCourse } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import type { Course, Enrollment, Lesson, Topic } from '@/types/lms'
import { go, replace } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

type TopicWithLessons = Topic & { lessons: Lesson[] }

interface CourseDetailPageProps {
  courseslug: string
}

function formatDuration(hours: number, minutes: number, seconds: number) {
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0) parts.push(`${String(minutes).padStart(2, '0')}m`)
  parts.push(`${String(seconds).padStart(2, '0')}s`)
  return parts.join(' ')
}

function calculateProgress(topics: TopicWithLessons[], enrollment?: Enrollment): number {
  const lessonIds = topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.id))
  if (lessonIds.length === 0) return 0

  const lessonIdSet = new Set(lessonIds)
  const completedCount = (enrollment?.completedLessons || []).filter((lessonId) =>
    lessonIdSet.has(lessonId)
  ).length

  const rawProgress = Math.round((completedCount / lessonIds.length) * 100)
  return Math.max(0, Math.min(100, rawProgress))
}

export default function CourseDetailPage({ courseslug }: CourseDetailPageProps) {
  const { isAdmin } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [topics, setTopics] = useState<TopicWithLessons[]>([])
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set())
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!courseslug) return

      const resolvedCourse = await getCourseBySlug(courseslug)
      if (!resolvedCourse) {
        replace('/')
        return
      }

      const baseTopics = await getTopicsByCourse(resolvedCourse.id)
      const resolvedTopics = await Promise.all(
        baseTopics.map(async (topic) => ({
          ...topic,
          lessons: await getLessonsByTopic(topic.id),
        }))
      )

      const enrollment = await getEnrollment(resolvedCourse.id)
      const nextProgress = calculateProgress(resolvedTopics, enrollment)

      if (!active) return

      setCourse(resolvedCourse)
      setTopics(resolvedTopics)
      setOpenTopics(new Set(resolvedTopics.map((topic) => topic.id)))
      setEnrolled(!!enrollment)
      setProgress(nextProgress)
    }

    void load()

    return () => {
      active = false
    }
  }, [courseslug])

  const totalLessons = useMemo(
    () => topics.reduce((sum, topic) => sum + topic.lessons.length, 0),
    [topics]
  )

  if (!course) return null

  const toggleTopic = (topicId: string) => {
    setOpenTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  const handleEnroll = async () => {
    if (!course) return
    try {
      const enrollment = await enrollCourse(course.id)
      setEnrolled(true)
      setProgress(calculateProgress(topics, enrollment))
    } catch {
      toast({ title: 'Gagal mendaftar kursus. Coba lagi.', variant: 'error' })
    }
  }

  return (
    <div class='min-h-screen bg-[hsl(var(--background))]'>
      <header class='border-b border-[hsl(var(--border))] bg-white'>
        <div class='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
          <div class='flex items-center gap-3'>
            <Button variant='ghost' size='icon' onClick={() => go('/')}>
              <ArrowLeft class='h-5 w-5' />
            </Button>
            <div class='flex h-9 w-9 items-center justify-center rounded-lg bg-black'>
              <BookOpen class='h-5 w-5 text-white' />
            </div>
            <h1 class='text-xl font-bold'>Detail Kursus</h1>
          </div>
          <div class='flex gap-2'>
            <Button variant='outline' size='sm' class='gap-2'>
              <Share2 class='h-4 w-4' /> Bagikan
            </Button>
            {isAdmin && (
              <Button size='sm' class='gap-2' onClick={() => go(`/admin/courses/${course.id}`)}>
                <Edit class='h-4 w-4' /> Edit Kursus
              </Button>
            )}
          </div>
        </div>
      </header>

      <main class='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div class='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <div class='space-y-8 lg:col-span-2'>
            <div>
              <div class='mb-6 aspect-video overflow-hidden rounded-xl bg-[hsl(var(--muted))]'>
                {course.featuredImage ? (
                  <img src={course.featuredImage} alt={course.title} class='h-full w-full object-cover' />
                ) : (
                  <div class='flex h-full w-full items-center justify-center'>
                    <ImageIcon class='h-16 w-16 text-[hsl(var(--muted-foreground))]/30' />
                  </div>
                )}
              </div>
              <div class='mb-3 flex items-center gap-2'>
                <Badge variant='outline'>{getStatusLabel(course.status)}</Badge>
              </div>
              <h2 class='mb-4 text-3xl font-bold'>{course.title || 'Kursus Tanpa Judul'}</h2>
              {course.description && (
                <div
                  class='lms-prose max-w-none text-[hsl(var(--muted-foreground))]'
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}
            </div>

            <div>
              <h3 class='mb-4 flex items-center gap-2 text-xl font-semibold'>
                <GraduationCap class='h-5 w-5 text-black' /> Kurikulum
              </h3>
              {topics.length === 0 ? (
                <p class='text-sm text-[hsl(var(--muted-foreground))]'>Konten kurikulum belum tersedia.</p>
              ) : (
                <div class='space-y-2'>
                  {topics.map((topic) => (
                    <div key={topic.id} class='rounded-lg border border-[hsl(var(--border))] px-4'>
                      <button
                        class='flex w-full items-center justify-between py-3 text-left text-sm font-medium'
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <span>
                          {topic.title}{' '}
                          <span class='text-xs font-normal text-[hsl(var(--muted-foreground))]'>
                            ({topic.lessons.length} pelajaran)
                          </span>
                        </span>
                        <span class='text-xs'>{openTopics.has(topic.id) ? '−' : '+'}</span>
                      </button>

                      {openTopics.has(topic.id) && (
                        <ul class='space-y-1 pb-3'>
                          {topic.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              class='flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]/50 cursor-pointer transition-colors'
                              onClick={() => go(`/courses/${course.slug}/lessons/${lesson.slug}`)}
                            >
                              <div class='flex items-center gap-2'>
                                <Video class='h-4 w-4 text-black' />
                                <span>{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge
                                    variant={lesson.previewType === 'free' ? 'default' : 'outline'}
                                    class='px-1.5 py-0 text-[10px]'
                                  >
                                    {getPreviewTypeLabel(lesson.previewType)}
                                  </Badge>
                                )}
                              </div>
                              {(lesson.videoPlaybackHours > 0 ||
                                lesson.videoPlaybackMinutes > 0 ||
                                lesson.videoPlaybackSeconds > 0) && (
                                  <span class='flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]'>
                                    <Clock class='h-3 w-3' />
                                    {formatDuration(
                                      lesson.videoPlaybackHours,
                                      lesson.videoPlaybackMinutes,
                                      lesson.videoPlaybackSeconds
                                    )}
                                  </span>
                                )}
                            </li>
                          ))}
                          {topic.lessons.length === 0 && (
                            <li class='py-2 text-xs text-[hsl(var(--muted-foreground))]'>Belum ada pelajaran</li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 class='mb-4 text-xl font-semibold'>Pertanyaan Umum</h3>
              <div class='space-y-2'>
                {[
                  {
                    q: 'Bagaimana cara mengakses materi kursus?',
                    a: 'Setelah mendaftar, semua materi tersedia di dashboard Anda.',
                  },
                  {
                    q: 'Apakah kursus bisa diakses lewat ponsel?',
                    a: 'Ya, platform responsif dan dapat digunakan di semua perangkat.',
                  },
                ].map((faq, index) => (
                  <details key={index} class='rounded-lg border border-[hsl(var(--border))] px-4'>
                    <summary class='cursor-pointer py-3 text-sm font-medium'>{faq.q}</summary>
                    <p class='pb-3 text-sm text-[hsl(var(--muted-foreground))]'>{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div class='space-y-4'>
            <Card>
              <CardContent class='space-y-4 p-5'>
                <InfoRow icon={<BookOpen class='h-4 w-4' />} label='Pelajaran' value={String(totalLessons)} />
                <InfoRow icon={<Eye class='h-4 w-4' />} label='Visibilitas' value={getVisibilityLabel(course.visibility)} />

                {course.categories.length > 0 && (
                  <div class='border-t border-[hsl(var(--border))] pt-2'>
                    <p class='mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]'>Kategori</p>
                    <div class='flex flex-wrap gap-1'>
                      {course.categories.map((category) => (
                        <Badge key={category} variant='secondary' class='text-xs'>
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {course.tags.length > 0 && (
                  <div class='border-t border-[hsl(var(--border))] pt-2'>
                    <p class='mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]'>Tag</p>
                    <div class='flex flex-wrap gap-1'>
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant='outline' class='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {enrolled ? (
                  <>
                    <Progress value={progress} class='h-2' />
                    <p class='text-center text-xs text-[hsl(var(--muted-foreground))]'>{progress}% selesai</p>
                    <Button class='w-full' onClick={() => go(`/courses/${course.slug}/lessons`)}>
                      <PlayCircle class='mr-2 h-4 w-4' /> Lanjut Belajar
                    </Button>
                  </>
                ) : (
                  <Button
                    class='w-full'
                    onClick={() => void handleEnroll()}
                  >
                    <BookOpen class='mr-2 h-4 w-4' /> Ikuti Kursus
                  </Button>
                )}

                {isAdmin && (
                  <Button variant='outline' class='w-full' onClick={() => go(`/admin/courses/${course.id}`)}>
                    <Edit class='mr-2 h-4 w-4' /> Edit Kursus
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: unknown; label: string; value: string }) {
  return (
    <div class='flex items-center justify-between text-sm'>
      <span class='flex items-center gap-2 text-[hsl(var(--muted-foreground))]'>
        {icon} {label}
      </span>
      <span class='font-medium'>{value}</span>
    </div>
  )
}
