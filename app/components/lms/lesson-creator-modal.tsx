import { useState } from 'hono/jsx'

import type { Lesson } from '@/types/lms'
import { createLesson, getLessonsByTopic, updateLesson } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/lms/rich-text-editor'
import { Film, ImageIcon, Upload, X } from '@/components/lms/icons'

interface LessonCreatorModalProps {
  courseId: string
  topicId: string
  topicTitle: string
  lesson?: Lesson
  onClose: () => void
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

export function LessonCreatorModal({
  courseId,
  topicId,
  topicTitle,
  lesson,
  onClose,
}: LessonCreatorModalProps) {
  const isEditing = !!lesson

  const [form, setForm] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    featuredImage: lesson?.featuredImage || '',
    videoUrl: lesson?.videoUrl || '',
    videoPlaybackHours: lesson?.videoPlaybackHours || 0,
    videoPlaybackMinutes: lesson?.videoPlaybackMinutes || 0,
    videoPlaybackSeconds: lesson?.videoPlaybackSeconds || 0,
    isPreview: lesson?.isPreview || false,
    previewType: (lesson?.previewType || 'free') as 'free' | 'pro',
  })

  const update = (data: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...data }))

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (fileEvent) => {
      update({ featuredImage: fileEvent.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Please enter a lesson name', variant: 'error' })
      return
    }

    if (isEditing && lesson) {
      await updateLesson(lesson.id, {
        title: form.title,
        content: form.content,
        featuredImage: form.featuredImage,
        videoUrl: form.videoUrl,
        videoPlaybackHours: form.videoPlaybackHours,
        videoPlaybackMinutes: form.videoPlaybackMinutes,
        videoPlaybackSeconds: form.videoPlaybackSeconds,
        isPreview: form.isPreview,
        previewType: form.previewType,
      })
      toast({ title: 'Lesson updated', variant: 'success' })
    } else {
      const existingLessons = await getLessonsByTopic(topicId)
      await createLesson({
        topicId,
        courseId,
        title: form.title,
        content: form.content,
        featuredImage: form.featuredImage,
        videoUrl: form.videoUrl,
        videoPlaybackHours: form.videoPlaybackHours,
        videoPlaybackMinutes: form.videoPlaybackMinutes,
        videoPlaybackSeconds: form.videoPlaybackSeconds,
        exerciseFiles: [],
        isPreview: form.isPreview,
        previewType: form.previewType,
        order: existingLessons.length,
        slug: '',
      })
      toast({ title: 'Lesson created', variant: 'success' })
    }

    onClose()
  }

  const thumbnail = getYouTubeThumbnail(form.videoUrl)

  return (
    <div class='fixed inset-0 z-50 flex items-center justify-center'>
      <div class='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      <div class='relative mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-2xl'>
        <div class='mb-4 flex items-center justify-between border-b border-[hsl(var(--border))] pb-3'>
          <div>
            <h2 class='text-lg font-semibold'>Lesson</h2>
            <p class='text-sm text-[hsl(var(--muted-foreground))]'>Topic: {topicTitle}</p>
          </div>
          <Button variant='ghost' size='icon' class='h-8 w-8' onClick={onClose}>
            <X class='h-4 w-4' />
          </Button>
        </div>

        <div class='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div class='space-y-4 md:col-span-2'>
            <div class='space-y-2'>
              <Label htmlFor='lesson-title'>Name</Label>
              <Input
                id='lesson-title'
                value={form.title}
                onInput={(event) => update({ title: (event.target as HTMLInputElement).value })}
                placeholder='Lesson title'
              />
            </div>

            <div class='space-y-2'>
              <Label>Content</Label>
              <div class='mb-2 flex gap-2'>
                <Button variant='outline' size='sm' class='text-xs' type='button'>
                  Tambahkan media
                </Button>
                <Button variant='outline' size='sm' class='text-xs' type='button'>
                  Add H5P Content
                </Button>
              </div>
              <RichTextEditor
                value={form.content}
                onChange={(content) => update({ content })}
                minHeight='180px'
              />
            </div>
          </div>

          <div class='space-y-4'>
            <div class='space-y-2 rounded-lg border border-[hsl(var(--border))] p-3'>
              <Label class='text-xs font-semibold'>Featured Image</Label>
              <p class='text-[10px] text-[hsl(var(--muted-foreground))]'>JPEG, PNG, GIF, WebP</p>
              {form.featuredImage ? (
                <div class='relative'>
                  <img src={form.featuredImage} alt='' class='w-full rounded' />
                  <Button
                    variant='destructive'
                    size='icon'
                    class='absolute right-1 top-1 h-5 w-5'
                    onClick={() => update({ featuredImage: '' })}
                  >
                    <X class='h-3 w-3' />
                  </Button>
                </div>
              ) : (
                <label class='flex cursor-pointer flex-col items-center gap-1 rounded border-2 border-dashed border-[hsl(var(--border))] p-4 hover:border-black/50'>
                  <ImageIcon class='h-6 w-6 text-[hsl(var(--muted-foreground))]' />
                  <span class='text-[10px] text-[hsl(var(--muted-foreground))]'>Upload image</span>
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/gif,image/webp'
                    class='hidden'
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <div class='space-y-2 rounded-lg border border-[hsl(var(--border))] p-3'>
              <Label class='flex items-center gap-1 text-xs font-semibold'>
                <Film class='h-3 w-3' /> Video
              </Label>
              <Input
                value={form.videoUrl}
                onInput={(event) => update({ videoUrl: (event.target as HTMLInputElement).value })}
                placeholder='YouTube URL'
                class='h-7 text-xs'
              />
              {thumbnail && <img src={thumbnail} alt='Video thumbnail' class='w-full rounded' />}

              <div>
                <Label class='text-[10px] text-[hsl(var(--muted-foreground))]'>Playback Time</Label>
                <div class='mt-1 grid grid-cols-3 gap-1.5'>
                  <div>
                    <Label class='text-[10px]'>Hour</Label>
                    <Input
                      type='number'
                      min={0}
                      value={form.videoPlaybackHours}
                      onInput={(event) =>
                        update({ videoPlaybackHours: +(event.target as HTMLInputElement).value })
                      }
                      class='h-7 text-xs'
                    />
                  </div>
                  <div>
                    <Label class='text-[10px]'>Min</Label>
                    <Input
                      type='number'
                      min={0}
                      max={59}
                      value={form.videoPlaybackMinutes}
                      onInput={(event) =>
                        update({ videoPlaybackMinutes: +(event.target as HTMLInputElement).value })
                      }
                      class='h-7 text-xs'
                    />
                  </div>
                  <div>
                    <Label class='text-[10px]'>Sec</Label>
                    <Input
                      type='number'
                      min={0}
                      max={59}
                      value={form.videoPlaybackSeconds}
                      onInput={(event) =>
                        update({ videoPlaybackSeconds: +(event.target as HTMLInputElement).value })
                      }
                      class='h-7 text-xs'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class='space-y-2 rounded-lg border border-[hsl(var(--border))] p-3'>
              <Label class='text-xs font-semibold'>Exercise Files</Label>
              <label class='flex cursor-pointer flex-col items-center gap-1 rounded border-2 border-dashed border-[hsl(var(--border))] p-3 hover:border-black/50'>
                <Upload class='h-5 w-5 text-[hsl(var(--muted-foreground))]' />
                <span class='text-[10px] text-[hsl(var(--muted-foreground))]'>Upload files</span>
                <input type='file' multiple class='hidden' />
              </label>
            </div>

            <div class='space-y-2 rounded-lg border border-[hsl(var(--border))] p-3'>
              <div class='flex items-center justify-between'>
                <Label class='text-xs font-semibold'>Lesson Preview</Label>
                <Switch
                  checked={form.isPreview}
                  onCheckedChange={(value) => update({ isPreview: value })}
                />
              </div>
              {form.isPreview && (
                <div class='flex gap-2'>
                  <Badge
                    variant={form.previewType === 'free' ? 'default' : 'secondary'}
                    class='cursor-pointer text-[10px]'
                    onClick={() => update({ previewType: 'free' })}
                  >
                    FREE
                  </Badge>
                  <Badge
                    variant={form.previewType === 'pro' ? 'outline' : 'secondary'}
                    class='cursor-pointer text-[10px]'
                    onClick={() => update({ previewType: 'pro' })}
                  >
                    PRO
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div class='mt-4 flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()}>{isEditing ? 'Update Lesson' : 'Create Lesson'}</Button>
        </div>
      </div>
    </div>
  )
}
