import type { Course } from '@/types/lms'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, Eye, ImageIcon, MoreVertical, Trash2 } from '@/components/lms/icons'
import { go } from '@/islands/lms/hooks/navigation'

interface CourseCardProps {
  course: Course
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const levelColors: Record<Course['difficultyLevel'], string> = {
  beginner: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  intermediate: 'border-amber-200 bg-amber-100 text-amber-700',
  advanced: 'border-rose-200 bg-rose-100 text-rose-700',
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  return (
    <Card
      class='group cursor-pointer overflow-hidden transition-shadow hover:shadow-md'
      onClick={() => go(`/courses/${course.slug}`)}
    >
      <div class='relative aspect-video overflow-hidden bg-[hsl(var(--muted))]'>
        {course.featuredImage ? (
          <img src={course.featuredImage} alt={course.title} class='h-full w-full object-cover' />
        ) : (
          <div class='flex h-full w-full items-center justify-center'>
            <ImageIcon class='h-10 w-10 text-[hsl(var(--muted-foreground))]/40' />
          </div>
        )}
        <div class='absolute left-2 top-2 flex gap-1.5'>
          <Badge variant='secondary' class={levelColors[course.difficultyLevel]}>
            {course.difficultyLevel}
          </Badge>
          <Badge variant={course.pricingModel === 'free' ? 'default' : 'outline'} class='text-xs'>
            {course.pricingModel === 'free' ? 'FREE' : 'PAID'}
          </Badge>
        </div>

        {(onEdit || onDelete) && (
          <DropdownMenu id={`course-card-${course.id}`}>
            <DropdownMenuTrigger dropdownId={`course-card-${course.id}`}>
              <Button
                variant='secondary'
                size='icon'
                class='absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical class='h-3.5 w-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent dropdownId={`course-card-${course.id}`} align='end'>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  go(`/courses/${course.slug}`)
                }}
              >
                <Eye class='mr-2 h-4 w-4' /> View
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(course.id)
                  }}
                >
                  <Edit class='mr-2 h-4 w-4' /> Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  class='text-red-600'
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(course.id)
                  }}
                >
                  <Trash2 class='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <CardContent class='p-4'>
        <h3 class='mb-1 line-clamp-2 text-sm font-semibold transition-colors hover:text-[hsl(var(--primary))]'>
          {course.title || 'Untitled Course'}
        </h3>
        <p class='text-xs text-[hsl(var(--muted-foreground))]'>
          {course.author || 'No author'} · {course.status}
        </p>
      </CardContent>
    </Card>
  )
}
