import { useEffect, useState } from 'hono/jsx'

import type { Course } from '@/types/lms'
import { createCourse, getCourse, updateCourse } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/cn'
import { AdditionalSettings } from '@/components/lms/additional-settings'
import { CourseBasics } from '@/components/lms/course-basics'
import { CurriculumEditor } from '@/components/lms/curriculum-editor'
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, Save } from '@/components/lms/icons'
import { Button } from '@/components/ui/button'
import { go, replace } from '@/islands/lms/hooks/navigation'
import { useAuth } from '@/islands/lms/hooks/use-auth'

const STEPS = [
  { key: 'basics', label: 'Basics', number: 1 },
  { key: 'curriculum', label: 'Curriculum', number: 2 },
  { key: 'additional', label: 'Additional', number: 3 },
] as const

const defaultCourse: Partial<Course> = {
  title: '',
  slug: '',
  description: '',
  difficultyLevel: 'beginner',
  visibility: 'public',
  featuredImage: '',
  pricingModel: 'free',
  categories: [],
  tags: [],
  author: '',
  isScheduled: false,
  scheduleDate: '',
  isPublicCourse: true,
  maxStudents: 0,
  certificate: false,
  status: 'draft',
}

interface CourseBuilderPageProps {
  id: string
}

export default function CourseBuilderPage({ id }: CourseBuilderPageProps) {
  const { user, isAdmin, loading } = useAuth()

  const isNew = id === 'new'

  const [step, setStep] = useState(0)
  const [courseData, setCourseData] = useState<Partial<Course>>(defaultCourse)
  const [courseId, setCourseId] = useState<string | null>(isNew ? null : id || null)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (loading) return
      if (!user) {
        replace('/login')
        return
      }
      if (!isAdmin) {
        replace('/')
        return
      }

      if (!isNew && id) {
        const existing = await getCourse(id)
        if (!active) return

        if (existing) {
          setCourseData(existing)
          setCourseId(existing.id)
        } else {
          replace('/')
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [loading, user, isAdmin, isNew, id])

  const handleChange = (data: Partial<Course>) => {
    setCourseData((prev) => ({ ...prev, ...data }))
  }

  const handleSave = async () => {
    if (!courseData.title?.trim()) {
      toast({ title: 'Please enter a course title', variant: 'error' })
      setStep(0)
      return
    }

    if (courseId) {
      await updateCourse(courseId, courseData)
      toast({ title: 'Course updated successfully', variant: 'success' })
    } else {
      const created = await createCourse(courseData as Omit<Course, 'id' | 'createdAt' | 'updatedAt'>)
      setCourseId(created.id)
      replace(`/admin/courses/${created.id}`)
      toast({ title: 'Course created successfully', variant: 'success' })
    }
  }

  const handleNext = async () => {
    if (step === 0 && !courseId && courseData.title?.trim()) {
      const created = await createCourse(courseData as Omit<Course, 'id' | 'createdAt' | 'updatedAt'>)
      setCourseId(created.id)
      replace(`/admin/courses/${created.id}`)
    } else if (courseId) {
      await updateCourse(courseId, courseData)
    }

    setStep((currentStep) => Math.min(currentStep + 1, 2))
  }

  if (loading) return null

  return (
    <div class='min-h-screen bg-[hsl(var(--background))]'>
      <header class='sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-white'>
        <div class='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div class='flex items-center justify-between py-3'>
            <div class='flex items-center gap-3'>
              <Button variant='ghost' size='icon' onClick={() => go('/')}>
                <ArrowLeft class='h-4 w-4' />
              </Button>
              <div class='flex items-center gap-2'>
                <BookOpen class='h-5 w-5 text-black' />
                <h1 class='text-lg font-semibold'>{isNew ? 'New Course' : courseData.title || 'Edit Course'}</h1>
              </div>
            </div>

            <div class='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                class='gap-1.5'
                disabled={!courseData.slug}
                onClick={() => {
                  if (!courseData.slug) return
                  go(`/courses/${courseData.slug}`)
                }}
              >
                <Eye class='h-3.5 w-3.5' /> Preview
              </Button>
              <Button size='sm' class='gap-1.5' onClick={() => void handleSave()}>
                <Save class='h-3.5 w-3.5' /> {courseId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>

          <div class='-mb-px flex gap-0'>
            {STEPS.map((stepItem, index) => (
              <button
                key={stepItem.key}
                onClick={() => setStep(index)}
                class={cn(
                  'flex items-center gap-2 border-b-2 border-transparent px-5 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]',
                  step === index && 'border-black text-black'
                )}
              >
                <span
                  class={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                    step === index
                      ? 'bg-black text-white'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  )}
                >
                  {index < step ? <Check class='h-3 w-3' /> : stepItem.number}
                </span>
                {stepItem.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main class='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {step === 0 && <CourseBasics course={courseData} onChange={handleChange} />}

        {step === 1 && courseId && <CurriculumEditor courseId={courseId} />}

        {step === 1 && !courseId && (
          <div class='py-16 text-center text-[hsl(var(--muted-foreground))]'>
            <p>Please save the course first before adding curriculum.</p>
            <Button class='mt-4' onClick={() => void handleSave()}>
              Save Course
            </Button>
          </div>
        )}

        {step === 2 && <AdditionalSettings course={courseData} onChange={handleChange} />}

        <div class='mt-8 flex justify-between border-t border-[hsl(var(--border))] pt-6'>
          <Button
            variant='outline'
            onClick={() => setStep((currentStep) => Math.max(currentStep - 1, 0))}
            disabled={step === 0}
            class='gap-2'
          >
            <ArrowLeft class='h-4 w-4' /> Back
          </Button>

          {step < 2 ? (
            <Button onClick={() => void handleNext()} class='gap-2'>
              Next <ArrowRight class='h-4 w-4' />
            </Button>
          ) : (
            <Button onClick={() => void handleSave()} class='gap-2'>
              <Save class='h-4 w-4' /> {courseId ? 'Update Course' : 'Save Course'}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
