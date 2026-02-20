import { useCallback, useEffect, useMemo, useState } from 'hono/jsx'

import type { Course, Lesson, Topic } from '@/types/lms'
import {
  enrollCourse,
  getCourseBySlug,
  getCourseProgress,
  getEnrollment,
  getLessonBySlug,
  getLessonsByTopic,
  getNote,
  getTopicsByCourse,
  saveNote,
  toggleLessonComplete,
} from '@/lib/lms-storage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeft,
  PanelLeftClose,
  StickyNote,
  Video,
  X,
} from '@/components/lms/icons'
import { go, replace, replaceUrl } from '@/islands/lms/hooks/navigation'
import { useIsMobile } from '@/islands/lms/hooks/use-mobile'

type TopicWithLessons = Topic & { lessons: Lesson[] }

interface CoursePlayerPageProps {
  courseslug: string
  lessonslug?: string
}

function toYouTubeEmbedUrl(url: string): string {
  if (url.includes('/embed/')) return url

  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`

  const watchMatch = url.match(/[?&]v=([^&#]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`

  return url
}

export default function CoursePlayerPage({ courseslug, lessonslug }: CoursePlayerPageProps) {
  const isMobile = useIsMobile()

  const [course, setCourse] = useState<Course | null>(null)
  const [topics, setTopics] = useState<TopicWithLessons[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview')
  const [progress, setProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [noteText, setNoteText] = useState('')
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isDragging, setIsDragging] = useState(false)

  const allLessons = useMemo(() => topics.flatMap((topic) => topic.lessons), [topics])
  const totalLessons = allLessons.length

  const courseId = course?.id

  const refreshProgress = useCallback(async () => {
    if (!courseId) return

    const [nextProgress, enrollment] = await Promise.all([
      getCourseProgress(courseId),
      getEnrollment(courseId),
    ])

    setProgress(nextProgress)
    setCompletedLessons(enrollment?.completedLessons || [])
  }, [courseId])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!courseslug) return

      const resolvedCourse = await getCourseBySlug(courseslug)
      if (!resolvedCourse) {
        replace('/')
        return
      }

      const resolvedId = resolvedCourse.id

      let enrollment = await getEnrollment(resolvedId)
      if (!enrollment) {
        try {
          enrollment = await enrollCourse(resolvedId)
        } catch {
          // ignore when user is not authenticated
        }
      }

      const baseTopics = await getTopicsByCourse(resolvedId)
      const resolvedTopics = await Promise.all(
        baseTopics.map(async (topic) => ({
          ...topic,
          lessons: await getLessonsByTopic(topic.id),
        }))
      )

      const openState: Record<string, boolean> = {}
      resolvedTopics.forEach((topic) => {
        openState[topic.id] = true
      })

      const resolvedLessons = resolvedTopics.flatMap((topic) => topic.lessons)
      let nextActiveLesson: Lesson | null = null

      if (lessonslug) {
        const foundLesson = await getLessonBySlug(resolvedId, lessonslug)
        nextActiveLesson = foundLesson || resolvedLessons[0] || null
      } else if (resolvedLessons.length > 0) {
        const completed = enrollment?.completedLessons || []
        const firstUncompleted = resolvedLessons.find((lesson) => !completed.includes(lesson.id))
        nextActiveLesson = firstUncompleted || resolvedLessons[0]
      }

      if (!active) return

      setCourse(resolvedCourse)
      setTopics(resolvedTopics)
      setOpenTopics(openState)
      setActiveLesson(nextActiveLesson)

      if (!lessonslug && nextActiveLesson?.slug) {
        replaceUrl(`/courses/${courseslug}/lessons/${nextActiveLesson.slug}`)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [courseslug, lessonslug])

  useEffect(() => {
    if (!courseId || !activeLesson) return

    const load = async () => {
      await refreshProgress()
      setNoteText(await getNote(courseId, activeLesson.id))
    }

    void load()
  }, [courseId, activeLesson, refreshProgress])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(Math.max(event.clientX, 240), 600)
      setSidebarWidth(nextWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.classList.add('select-none')

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('select-none')
    }
  }, [isDragging])

  if (!course) return null

  const isComplete = (lessonId: string) => completedLessons.includes(lessonId)

  const completedInTopic = (topic: TopicWithLessons) =>
    topic.lessons.filter((lesson) => isComplete(lesson.id)).length

  const handleToggleComplete = async (lessonId: string) => {
    if (!courseId) return
    try {
      await toggleLessonComplete(courseId, lessonId)
      await refreshProgress()
    } catch {
      toast({ title: 'Silakan login untuk update progres', variant: 'error' })
    }
  }

  const handleMarkComplete = async () => {
    if (!courseId || !activeLesson) return

    try {
      if (!completedLessons.includes(activeLesson.id)) {
        await toggleLessonComplete(courseId, activeLesson.id)
        await refreshProgress()
      }
    } catch {
      toast({ title: 'Silakan login untuk update progres', variant: 'error' })
      return
    }

    const currentIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id)
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      setActiveLesson(nextLesson)
      if (nextLesson.slug) {
        replaceUrl(`/courses/${courseslug}/lessons/${nextLesson.slug}`)
      }
    }
  }

  const handleSaveNote = async () => {
    if (!courseId || !activeLesson) return
    try {
      await saveNote(courseId, activeLesson.id, noteText)
      toast({ title: 'Note saved', variant: 'success' })
    } catch {
      toast({ title: 'Silakan login untuk menyimpan catatan', variant: 'error' })
    }
  }

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson)
    if (courseslug && lesson.slug) {
      replaceUrl(`/courses/${courseslug}/lessons/${lesson.slug}`)
    }
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const sidebarContent = (
    <>
      <div class='border-b border-[hsl(var(--border))] p-4'>
        <h2 class='text-sm font-semibold'>Course Content</h2>
      </div>

      <div class='divide-y divide-[hsl(var(--border))]'>
        {topics.map((topic) => (
          <div key={topic.id}>
            <button
              class='flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]/50'
              onClick={() =>
                setOpenTopics((prev) => ({
                  ...prev,
                  [topic.id]: !prev[topic.id],
                }))
              }
            >
              <div class='flex min-w-0 items-center gap-2'>
                {openTopics[topic.id] ? (
                  <ChevronDown class='h-4 w-4 shrink-0' />
                ) : (
                  <ChevronRight class='h-4 w-4 shrink-0' />
                )}
                <span class='truncate text-left'>{topic.title}</span>
              </div>
              <span class='ml-2 shrink-0 text-xs text-[hsl(var(--muted-foreground))]'>
                {completedInTopic(topic)}/{topic.lessons.length}
              </span>
            </button>

            {openTopics[topic.id] && (
              <div>
                {topic.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    class={`flex w-full items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                      activeLesson?.id === lesson.id
                        ? 'border-l-2 border-black bg-black/10 text-black'
                        : 'hover:bg-[hsl(var(--muted))]/50'
                    }`}
                  >
                    <Checkbox
                      checked={isComplete(lesson.id)}
                      onCheckedChange={() => void handleToggleComplete(lesson.id)}
                      onClick={(event) => event.stopPropagation()}
                      class='shrink-0'
                    />
                    <Video class='h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]' />
                    <span class='flex-1 truncate text-left'>{lesson.title}</span>
                    {lesson.isPreview && (
                      <Badge variant={lesson.previewType === 'free' ? 'default' : 'outline'} class='text-[10px]'>
                        {lesson.previewType.toUpperCase()}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div class='flex h-[100dvh] flex-col overflow-hidden bg-[hsl(var(--background))]'>
      <header class='flex shrink-0 items-center justify-between gap-2 border-b border-[hsl(var(--border))] bg-white px-3 py-3 md:px-4'>
        <div class='flex min-w-0 items-center gap-2'>
          {isMobile ? (
            <Button variant='ghost' size='icon' class='shrink-0' onClick={() => setSidebarOpen(true)}>
              <Menu class='h-5 w-5' />
            </Button>
          ) : (
            <Button
              variant='ghost'
              size='icon'
              class='shrink-0'
              onClick={() => setDesktopSidebarVisible((visible) => !visible)}
            >
              {desktopSidebarVisible ? (
                <PanelLeftClose class='h-5 w-5' />
              ) : (
                <PanelLeft class='h-5 w-5' />
              )}
            </Button>
          )}

          <Button variant='ghost' size='icon' class='shrink-0' onClick={() => go(`/courses/${courseslug}`)}>
            <ArrowLeft class='h-5 w-5' />
          </Button>
          <h1 class='truncate text-sm font-semibold'>{course.title}</h1>
        </div>

        <div class='flex shrink-0 items-center gap-2 md:gap-4'>
          <span class='hidden text-xs text-[hsl(var(--muted-foreground))] sm:inline'>
            {completedLessons.length} of {totalLessons} ({progress}%)
          </span>
          <Progress value={progress} class='h-2 w-16 md:w-32' />
          <Button
            size='sm'
            onClick={() => void handleMarkComplete()}
            disabled={!activeLesson}
            class='hidden sm:flex'
          >
            <CheckCircle2 class='mr-1 h-4 w-4' /> Mark as Complete
          </Button>
          <Button
            size='icon'
            variant='outline'
            onClick={() => void handleMarkComplete()}
            disabled={!activeLesson}
            class='h-8 w-8 shrink-0 sm:hidden'
          >
            <CheckCircle2 class='h-4 w-4' />
          </Button>
        </div>
      </header>

      <div class='flex flex-1 overflow-hidden'>
        {isMobile && sidebarOpen && (
          <div class='fixed inset-0 z-40 flex'>
            <div class='w-[85vw] max-w-sm border-r border-[hsl(var(--border))] bg-white pt-8'>
              <div class='absolute right-2 top-2'>
                <Button variant='ghost' size='icon' onClick={() => setSidebarOpen(false)}>
                  <X class='h-4 w-4' />
                </Button>
              </div>
              <div class='h-full overflow-y-auto'>{sidebarContent}</div>
            </div>
            <button class='flex-1 bg-black/50' onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {!isMobile && desktopSidebarVisible && (
          <div class='relative flex h-full shrink-0' style={{ width: sidebarWidth }}>
            <aside class='h-full w-full overflow-y-auto border-r border-[hsl(var(--border))] bg-white'>
              {sidebarContent}
            </aside>
            <div
              onMouseDown={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              class={`absolute bottom-0 right-[-3px] top-0 z-10 w-1.5 cursor-col-resize transition-colors hover:bg-black/50 ${
                isDragging ? 'bg-black/50' : ''
              }`}
            />
          </div>
        )}

        <main class='flex-1 overflow-y-auto'>
          {activeLesson ? (
            <div class='mx-auto max-w-4xl p-4 md:p-6'>
              <h2 class='mb-4 text-lg font-bold md:text-xl'>{activeLesson.title}</h2>

              {activeLesson.videoUrl && (
                <div class='mb-4 aspect-video overflow-hidden rounded-lg bg-black md:mb-6'>
                  <iframe
                    src={toYouTubeEmbedUrl(activeLesson.videoUrl)}
                    class='h-full w-full'
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              )}

              <div class='mt-4'>
                <div class='inline-flex rounded-[var(--radius)] bg-[hsl(var(--muted))] p-1'>
                  <button
                    class={`inline-flex items-center gap-1.5 rounded-[calc(var(--radius)-0.25rem)] px-3 py-1.5 text-sm ${
                      activeTab === 'overview' ? 'bg-white shadow-sm' : ''
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <BookOpen class='h-4 w-4' /> Overview
                  </button>
                  <button
                    class={`inline-flex items-center gap-1.5 rounded-[calc(var(--radius)-0.25rem)] px-3 py-1.5 text-sm ${
                      activeTab === 'notes' ? 'bg-white shadow-sm' : ''
                    }`}
                    onClick={() => setActiveTab('notes')}
                  >
                    <StickyNote class='h-4 w-4' /> Notes
                  </button>
                </div>

                {activeTab === 'overview' ? (
                  <div class='mt-4'>
                    {activeLesson.content ? (
                      <div
                        class='lms-prose max-w-none'
                        dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                      />
                    ) : (
                      <p class='text-sm text-[hsl(var(--muted-foreground))]'>
                        No content available for this lesson.
                      </p>
                    )}
                  </div>
                ) : (
                  <div class='mt-4 space-y-3'>
                    <Textarea
                      placeholder='Write your notes here...'
                      value={noteText}
                      onInput={(event) => setNoteText((event.target as HTMLTextAreaElement).value)}
                      class='min-h-[200px]'
                    />
                    <Button size='sm' onClick={() => void handleSaveNote()}>
                      Save Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div class='flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]'>
              <p>Select a lesson to start learning</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
