import { useState } from 'hono/jsx'

import type { Lesson, Topic } from '@/types/lms'
import {
  createTopic,
  deleteLesson,
  deleteTopic,
  getLessonsByTopic,
  getTopicsByCourse,
  reorderLessons,
  reorderTopics,
  updateTopic,
} from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LessonCreatorModal } from '@/components/lms/lesson-creator-modal'
import { SpreadsheetImportModal } from '@/components/lms/spreadsheet-import-modal'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ClipboardList,
  Edit,
  FileSpreadsheet,
  Gamepad2,
  GripVertical,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
} from '@/components/lms/icons'

interface CurriculumEditorProps {
  courseId: string
  refreshKey?: number
  onRefresh?: () => void
}

export function CurriculumEditor({ courseId, refreshKey, onRefresh }: CurriculumEditorProps) {
  void refreshKey
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [lessonModal, setLessonModal] = useState<{
    topicId: string
    topicTitle: string
    lesson?: Lesson
  } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [, setRefreshCount] = useState(0)

  const refresh = () => {
    setRefreshCount((count) => count + 1)
    onRefresh?.()
  }

  const topics = getTopicsByCourse(courseId)

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedTopics(new Set(topics.map((topic) => topic.id)))
  }

  const handleAddTopic = () => {
    const order = topics.length
    const topic = createTopic({ courseId, title: `Topic ${order + 1}`, order })
    setExpandedTopics((prev) => new Set(prev).add(topic.id))
    toast({ title: 'Topic added', variant: 'success' })
    refresh()
  }

  const handleDeleteTopic = (id: string) => {
    deleteTopic(id)
    toast({ title: 'Topic deleted', variant: 'success' })
    refresh()
  }

  const startEditTopic = (topic: Topic) => {
    setEditingTopic(topic.id)
    setEditTitle(topic.title)
  }

  const saveEditTopic = () => {
    if (!editingTopic || !editTitle.trim()) return
    updateTopic(editingTopic, { title: editTitle.trim() })
    setEditingTopic(null)
    refresh()
  }

  const handleDeleteLesson = (id: string) => {
    deleteLesson(id)
    toast({ title: 'Lesson deleted', variant: 'success' })
    refresh()
  }

  const [dragTopicId, setDragTopicId] = useState<string | null>(null)

  const handleTopicDragStart = (id: string) => setDragTopicId(id)
  const handleTopicDrop = (targetId: string) => {
    if (!dragTopicId || dragTopicId === targetId) return

    const ids = topics.map((topic) => topic.id)
    const fromIndex = ids.indexOf(dragTopicId)
    const toIndex = ids.indexOf(targetId)

    ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, dragTopicId)
    reorderTopics(courseId, ids)
    setDragTopicId(null)
    refresh()
  }

  const [dragLessonId, setDragLessonId] = useState<string | null>(null)
  const [dragLessonTopicId, setDragLessonTopicId] = useState<string | null>(null)

  const handleLessonDragStart = (lessonId: string, topicId: string) => {
    setDragLessonId(lessonId)
    setDragLessonTopicId(topicId)
  }

  const handleLessonDrop = (targetLessonId: string, topicId: string) => {
    if (!dragLessonId || dragLessonId === targetLessonId || dragLessonTopicId !== topicId) return

    const lessons = getLessonsByTopic(topicId)
    const ids = lessons.map((lesson) => lesson.id)
    const fromIndex = ids.indexOf(dragLessonId)
    const toIndex = ids.indexOf(targetLessonId)

    ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, dragLessonId)
    reorderLessons(topicId, ids)
    setDragLessonId(null)
    setDragLessonTopicId(null)
    refresh()
  }

  return (
    <div class='space-y-4'>
      <div class='flex items-center justify-between'>
        <h3 class='text-lg font-semibold'>Course Curriculum</h3>
        <Button variant='ghost' size='sm' onClick={expandAll} class='gap-1 text-xs'>
          <ChevronsDownUp class='h-3.5 w-3.5' /> Expand All
        </Button>
      </div>

      <div class='space-y-3'>
        {topics.map((topic) => {
          const lessons = getLessonsByTopic(topic.id)
          const isExpanded = expandedTopics.has(topic.id)

          return (
            <div
              key={topic.id}
              class='overflow-hidden rounded-lg border border-[hsl(var(--border))]'
              draggable
              onDragStart={() => handleTopicDragStart(topic.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleTopicDrop(topic.id)}
            >
              <div
                class='flex cursor-pointer items-center gap-2 bg-[hsl(var(--muted))]/40 p-3'
                onClick={() => toggleTopic(topic.id)}
              >
                <GripVertical class='h-4 w-4 cursor-grab text-[hsl(var(--muted-foreground))]' />
                {isExpanded ? <ChevronDown class='h-4 w-4' /> : <ChevronRight class='h-4 w-4' />}

                {editingTopic === topic.id ? (
                  <Input
                    value={editTitle}
                    onInput={(event) => setEditTitle((event.target as HTMLInputElement).value)}
                    onBlur={saveEditTopic}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveEditTopic()
                    }}
                    class='h-7 flex-1 text-sm'
                    autoFocus
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : (
                  <span class='flex-1 text-sm font-medium'>{topic.title}</span>
                )}

                <Badge variant='secondary' class='text-xs'>
                  {lessons.length} lessons
                </Badge>

                <Button
                  variant='ghost'
                  size='icon'
                  class='h-7 w-7'
                  onClick={(event) => {
                    event.stopPropagation()
                    startEditTopic(topic)
                  }}
                >
                  <Pencil class='h-3.5 w-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  class='h-7 w-7 text-red-600'
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDeleteTopic(topic.id)
                  }}
                >
                  <Trash2 class='h-3.5 w-3.5' />
                </Button>
              </div>

              {isExpanded && (
                <div class='space-y-2 p-3'>
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      class='group flex items-center gap-2 rounded-md border border-[hsl(var(--border))]/50 bg-white p-2 transition-colors hover:border-black/30'
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation()
                        handleLessonDragStart(lesson.id, topic.id)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onDrop={(event) => {
                        event.stopPropagation()
                        handleLessonDrop(lesson.id, topic.id)
                      }}
                    >
                      <GripVertical class='h-3.5 w-3.5 cursor-grab text-[hsl(var(--muted-foreground))]' />
                      <BookOpen class='h-3.5 w-3.5 text-black' />
                      <span
                        class='flex-1 cursor-pointer text-sm'
                        onClick={() =>
                          setLessonModal({
                            topicId: topic.id,
                            topicTitle: topic.title,
                            lesson,
                          })
                        }
                      >
                        {lesson.title}
                      </span>
                      {lesson.isPreview && (
                        <Badge
                          variant={lesson.previewType === 'free' ? 'default' : 'outline'}
                          class='px-1.5 py-0 text-[10px]'
                        >
                          {lesson.previewType === 'free' ? 'FREE' : 'PRO'}
                        </Badge>
                      )}
                      <Button
                        variant='ghost'
                        size='icon'
                        class='h-6 w-6 opacity-0 group-hover:opacity-100'
                        onClick={() =>
                          setLessonModal({
                            topicId: topic.id,
                            topicTitle: topic.title,
                            lesson,
                          })
                        }
                      >
                        <Edit class='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        class='h-6 w-6 text-red-600 opacity-0 group-hover:opacity-100'
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <Trash2 class='h-3 w-3' />
                      </Button>
                    </div>
                  ))}

                  <div class='flex flex-wrap gap-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      class='gap-1 text-xs'
                      onClick={() =>
                        setLessonModal({
                          topicId: topic.id,
                          topicTitle: topic.title,
                        })
                      }
                    >
                      <Plus class='h-3 w-3' /> Lesson
                    </Button>
                    <Button variant='outline' size='sm' class='gap-1 text-xs' disabled>
                      <HelpCircle class='h-3 w-3' /> Quiz
                    </Button>
                    <Button variant='outline' size='sm' class='gap-1 text-xs' disabled>
                      <Gamepad2 class='h-3 w-3' /> Interactive Quiz
                    </Button>
                    <Button variant='outline' size='sm' class='gap-1 text-xs' disabled>
                      <ClipboardList class='h-3 w-3' /> Assignment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div class='flex gap-2'>
        <Button variant='outline' class='flex-1 gap-2' onClick={handleAddTopic}>
          <Plus class='h-4 w-4' /> Add Topic
        </Button>
        <Button variant='outline' class='gap-2' onClick={() => setShowImportModal(true)}>
          <FileSpreadsheet class='h-4 w-4' /> Import dari Spreadsheet
        </Button>
      </div>

      {lessonModal && (
        <LessonCreatorModal
          courseId={courseId}
          topicId={lessonModal.topicId}
          topicTitle={lessonModal.topicTitle}
          lesson={lessonModal.lesson}
          onClose={() => {
            setLessonModal(null)
            refresh()
          }}
        />
      )}

      {showImportModal && (
        <SpreadsheetImportModal
          courseId={courseId}
          onClose={() => {
            setShowImportModal(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}
