import type { Course } from '@/types/lms'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { getStatusLabel } from '@/lib/lms-labels'
import { go } from '@/islands/lms/hooks/navigation'

interface CourseCardProps {
  course: Course
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}



export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const deleteDialogId = `delete-course-${course.id}`

  return (
    <Card
      class='group cursor-pointer overflow-hidden transition-shadow hover:shadow-md'
      onClick={(event) => {
        const target = event.target as HTMLElement | null
        if (
          target?.closest(
            '[data-ui-dropdown-root], [data-ui-alert-dialog-wrapper], [data-ui-alert-dialog-trigger], [data-ui-alert-dialog-action]'
          )
        ) {
          return
        }
        go(`/courses/${course.slug}`)
      }}
    >
      <div class='relative aspect-video overflow-hidden bg-[hsl(var(--muted))]'>
        {course.featuredImage ? (
          <img src={course.featuredImage} alt={course.title} class='h-full w-full object-cover' />
        ) : (
          <div class='flex h-full w-full items-center justify-center'>
            <ImageIcon class='h-10 w-10 text-[hsl(var(--muted-foreground))]/40' />
          </div>
        )}


        <DropdownMenu id={`course-card-${course.id}`}>
          <DropdownMenuTrigger
            dropdownId={`course-card-${course.id}`}
            class='absolute right-2 top-2 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'
          >
            <Button
              variant='secondary'
              size='icon'
              class='h-7 w-7'
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
              <Eye class='mr-2 h-4 w-4' /> Lihat
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(course.id)
                }}
              >
                <Edit class='mr-2 h-4 w-4' /> Ubah
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <AlertDialog id={deleteDialogId} />
                <AlertDialogTrigger dialogId={deleteDialogId} class='contents'>
                  <DropdownMenuItem class='text-red-600'>
                    <Trash2 class='mr-2 h-4 w-4' /> Hapus
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {onDelete && (
          <AlertDialogContent dialogId={deleteDialogId} size='sm'>
            <AlertDialogHeader>
              <AlertDialogTitle dialogId={deleteDialogId}>Hapus Kursus?</AlertDialogTitle>
              <AlertDialogDescription dialogId={deleteDialogId}>
                Tindakan ini tidak dapat dibatalkan. Kursus dan data terkait akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction dialogId={deleteDialogId}>
                <Button variant='secondary'>Batal</Button>
              </AlertDialogAction>
              <AlertDialogAction dialogId={deleteDialogId}>
                <Button
                  variant='destructive'
                  onClick={() => onDelete(course.id)}
                >
                  Hapus
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>

      <CardContent class='p-4'>
        <h3 class='mb-1 line-clamp-2 text-sm font-semibold transition-colors hover:text-[hsl(var(--primary))]'>
          {course.title || 'Kursus Tanpa Judul'}
        </h3>
      </CardContent>
    </Card>
  )
}
