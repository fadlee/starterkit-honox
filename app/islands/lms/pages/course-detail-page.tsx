import { useEffect, useMemo, useState } from 'hono/jsx'

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  ImageIcon,
  PlayCircle,
  Share2,
  User,
  Users,
  Video,
} from '@/components/lms/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { enrollCourse, getCourseBySlug, getCourseProgress, getEnrollment, getLessonsByTopic, getTopicsByCourse } from '@/lib/lms-storage'
import type { Course, Lesson, Topic } from '@/types/lms'
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

export default function CourseDetailPage({ courseslug }: CourseDetailPageProps) {
  const { isAdmin } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [topics, setTopics] = useState<TopicWithLessons[]>([])
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set())
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!courseslug) return

    const resolvedCourse = getCourseBySlug(courseslug)
    if (!resolvedCourse) {
      replace('/')
      return
    }

    setCourse(resolvedCourse)

    const resolvedTopics = getTopicsByCourse(resolvedCourse.id).map((topic) => ({
      ...topic,
      lessons: getLessonsByTopic(topic.id),
    }))

    setTopics(resolvedTopics)
    setOpenTopics(new Set(resolvedTopics.map((topic) => topic.id)))
    setEnrolled(!!getEnrollment(resolvedCourse.id))
    setProgress(getCourseProgress(resolvedCourse.id))
  }, [courseslug])

  const totalLessons = useMemo(
    () => topics.reduce((sum, topic) => sum + topic.lessons.length, 0),
    [topics]
  )

  if (!course) return null

  const levelColors: Record<Course['difficultyLevel'], string> = {
    beginner: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    intermediate: 'border-amber-200 bg-amber-100 text-amber-700',
    advanced: 'border-rose-200 bg-rose-100 text-rose-700',
  }

  const toggleTopic = (topicId: string) => {
    setOpenTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
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
            <h1 class='text-xl font-bold'>Course Detail</h1>
          </div>
          <div class='flex gap-2'>
            <Button variant='outline' size='sm' class='gap-2'>
              <Share2 class='h-4 w-4' /> Share
            </Button>
            {isAdmin && (
              <Button size='sm' class='gap-2' onClick={() => go(`/admin/courses/${course.id}`)}>
                <Edit class='h-4 w-4' /> Edit Course
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
                <Badge variant='secondary' class={levelColors[course.difficultyLevel]}>
                  {course.difficultyLevel}
                </Badge>
                <Badge variant={course.pricingModel === 'free' ? 'default' : 'outline'}>
                  {course.pricingModel === 'free' ? 'FREE' : 'PAID'}
                </Badge>
                <Badge variant='outline'>{course.status}</Badge>
              </div>
              <h2 class='mb-4 text-3xl font-bold'>{course.title || 'Untitled Course'}</h2>
              {course.description && (
                <div
                  class='lms-prose max-w-none text-[hsl(var(--muted-foreground))]'
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}
            </div>

            <div>
              <h3 class='mb-4 flex items-center gap-2 text-xl font-semibold'>
                <GraduationCap class='h-5 w-5 text-black' /> Curriculum
              </h3>
              {topics.length === 0 ? (
                <p class='text-sm text-[hsl(var(--muted-foreground))]'>No curriculum content yet.</p>
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
                            ({topic.lessons.length} lesson{topic.lessons.length !== 1 ? 's' : ''})
                          </span>
                        </span>
                        <span class='text-xs'>{openTopics.has(topic.id) ? '−' : '+'}</span>
                      </button>

                      {openTopics.has(topic.id) && (
                        <ul class='space-y-1 pb-3'>
                          {topic.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              class='flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]/50'
                            >
                              <div class='flex items-center gap-2'>
                                <Video class='h-4 w-4 text-black' />
                                <span>{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge
                                    variant={lesson.previewType === 'free' ? 'default' : 'outline'}
                                    class='px-1.5 py-0 text-[10px]'
                                  >
                                    {lesson.previewType === 'free' ? 'FREE' : 'PRO'}
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
                            <li class='py-2 text-xs text-[hsl(var(--muted-foreground))]'>No lessons yet</li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 class='mb-4 text-xl font-semibold'>FAQ</h3>
              <div class='space-y-2'>
                {[
                  {
                    q: 'How do I access the course materials?',
                    a: 'Once enrolled, all materials are available in your dashboard.',
                  },
                  {
                    q: 'Is there a certificate upon completion?',
                    a: course.certificate
                      ? 'Yes, a certificate is awarded upon completing all lessons.'
                      : 'No certificate is provided for this course.',
                  },
                  {
                    q: 'Can I access the course on mobile?',
                    a: 'Yes, the platform is fully responsive and works on all devices.',
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
                <div class='border-b border-[hsl(var(--border))] pb-4 text-center'>
                  <span class='text-2xl font-bold'>{course.pricingModel === 'free' ? 'Free' : 'Paid'}</span>
                </div>

                <InfoRow icon={<BarChart3 class='h-4 w-4' />} label='Difficulty' value={course.difficultyLevel} />
                <InfoRow icon={<BookOpen class='h-4 w-4' />} label='Lessons' value={String(totalLessons)} />
                <InfoRow icon={<User class='h-4 w-4' />} label='Author' value={course.author || 'N/A'} />
                <InfoRow icon={<Eye class='h-4 w-4' />} label='Visibility' value={course.visibility} />
                <InfoRow
                  icon={<Users class='h-4 w-4' />}
                  label='Max Students'
                  value={course.maxStudents > 0 ? String(course.maxStudents) : 'Unlimited'}
                />
                <InfoRow
                  icon={<Award class='h-4 w-4' />}
                  label='Certificate'
                  value={course.certificate ? 'Yes' : 'No'}
                />

                {course.categories.length > 0 && (
                  <div class='border-t border-[hsl(var(--border))] pt-2'>
                    <p class='mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]'>Categories</p>
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
                    <p class='mb-2 text-xs font-medium text-[hsl(var(--muted-foreground))]'>Tags</p>
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
                    <p class='text-center text-xs text-[hsl(var(--muted-foreground))]'>{progress}% complete</p>
                    <Button class='w-full' onClick={() => go(`/courses/${course.slug}/lessons`)}>
                      <PlayCircle class='mr-2 h-4 w-4' /> Continue Learning
                    </Button>
                  </>
                ) : (
                  <Button
                    class='w-full'
                    onClick={() => {
                      enrollCourse(course.id)
                      setEnrolled(true)
                    }}
                  >
                    <BookOpen class='mr-2 h-4 w-4' /> Enroll Course
                  </Button>
                )}

                {isAdmin && (
                  <Button variant='outline' class='w-full' onClick={() => go(`/admin/courses/${course.id}`)}>
                    <Edit class='mr-2 h-4 w-4' /> Edit Course
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

function InfoRow({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div class='flex items-center justify-between text-sm'>
      <span class='flex items-center gap-2 text-[hsl(var(--muted-foreground))]'>
        {icon} {label}
      </span>
      <span class='font-medium capitalize'>{value}</span>
    </div>
  )
}
