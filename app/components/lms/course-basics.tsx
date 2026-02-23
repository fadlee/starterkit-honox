import { useState } from 'hono/jsx'

import type { Course } from '@/types/lms'
import { DEFAULT_CATEGORIES } from '@/types/lms'
import { generateSlug } from '@/lib/lms-storage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/lms/rich-text-editor'
import { ImageIcon, Link, Plus, Search, Upload, X } from '@/components/lms/icons'

interface CourseBasicsProps {
  course: Partial<Course>
  onChange: (data: Partial<Course>) => void
}

export function CourseBasics({ course, onChange }: CourseBasicsProps) {
  const [categorySearch, setCategorySearch] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]
  const filteredCategories = allCategories.filter((item) =>
    item.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const handleTitleChange = (title: string) => {
    onChange({ title, slug: generateSlug(title) })
  }

  const toggleCategory = (category: string) => {
    const current = course.categories || []
    onChange({
      categories: current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !(course.tags || []).includes(tagInput.trim())) {
      onChange({ tags: [...(course.tags || []), tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    onChange({ tags: (course.tags || []).filter((item) => item !== tag) })
  }

  const addCategory = () => {
    if (categorySearch.trim() && !allCategories.includes(categorySearch.trim())) {
      setCustomCategories((prev) => [...prev, categorySearch.trim()])
      toggleCategory(categorySearch.trim())
      setCategorySearch('')
    }
  }

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (fileEvent) => {
      onChange({ featuredImage: fileEvent.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div class='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      <div class='space-y-6 lg:col-span-2'>
        <div class='space-y-2'>
          <Label htmlFor='title'>Course Title</Label>
          <Input
            id='title'
            value={course.title || ''}
            onInput={(event) => handleTitleChange((event.target as HTMLInputElement).value)}
            placeholder='Enter course title'
          />
        </div>

        <div class='space-y-2'>
          <Label htmlFor='slug'>Course URL Slug</Label>
          <div class='flex items-center gap-2'>
            <span class='text-sm text-[hsl(var(--muted-foreground))]'>/courses/</span>
            <Input
              id='slug'
              value={course.slug || ''}
              onInput={(event) =>
                onChange({ slug: (event.target as HTMLInputElement).value })
              }
              placeholder='course-url-slug'
            />
          </div>
        </div>

        <div class='space-y-2'>
          <Label>Description</Label>
          <RichTextEditor
            value={course.description || ''}
            onChange={(description) => onChange({ description })}
          />
        </div>

        <div class='rounded-lg border border-[hsl(var(--border))] p-4'>
          <h4 class='mb-3 text-sm font-semibold'>Publishing</h4>

          <div class='space-y-2'>
            <Label htmlFor='course-status'>Course Status</Label>
            <select
              id='course-status'
              class='flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm'
              value={course.status || 'draft'}
              onChange={(event) =>
                onChange({ status: (event.target as HTMLSelectElement).value as Course['status'] })
              }
            >
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
            </select>
            <p class='text-xs text-[hsl(var(--muted-foreground))]'>
              Set to <strong>Published</strong> to make this course visible on the dashboard.
            </p>
          </div>

          <div class='mt-4 flex items-center justify-between'>
            <Label>Public Course</Label>
            <Switch
              checked={course.isPublicCourse ?? true}
              onCheckedChange={(value) => onChange({ isPublicCourse: value })}
            />
          </div>
        </div>
      </div>

      <div class='space-y-5'>
        <div class='space-y-3 rounded-lg border border-[hsl(var(--border))] p-4'>
          <Label htmlFor='visibility'>Visibility</Label>
          <select
            id='visibility'
            class='flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm'
            value={course.visibility || 'public'}
            onChange={(event) =>
              onChange({ visibility: (event.target as HTMLSelectElement).value as Course['visibility'] })
            }
          >
            <option value='public'>Public</option>
            <option value='private'>Private</option>
          </select>

          <div class='flex items-center justify-between pt-2'>
            <Label class='text-sm'>Schedule</Label>
            <Switch
              checked={course.isScheduled ?? false}
              onCheckedChange={(value) => onChange({ isScheduled: value })}
            />
          </div>
          {course.isScheduled && (
            <Input
              type='datetime-local'
              value={course.scheduleDate || ''}
              onInput={(event) =>
                onChange({ scheduleDate: (event.target as HTMLInputElement).value })
              }
            />
          )}
        </div>

        <div class='space-y-3 rounded-lg border border-[hsl(var(--border))] p-4'>
          <Label>Featured Image</Label>
          {course.featuredImage ? (
            <div class='relative'>
              <img src={course.featuredImage} alt='Featured' class='w-full rounded-md' />
              <Button
                variant='destructive'
                size='icon'
                class='absolute right-1 top-1 h-6 w-6'
                onClick={() => {
                  onChange({ featuredImage: '' })
                  setImageUrl('')
                }}
              >
                <X class='h-3 w-3' />
              </Button>
            </div>
          ) : (
            <>
              <div class='flex gap-1 rounded-md bg-[hsl(var(--muted))] p-0.5'>
                <button
                  type='button'
                  class={`flex-1 rounded-sm py-1.5 text-xs transition-colors ${imageMode === 'upload'
                      ? 'bg-white text-[hsl(var(--foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  onClick={() => setImageMode('upload')}
                >
                  <span class='inline-flex items-center gap-1.5'>
                    <Upload class='h-3 w-3' /> Upload
                  </span>
                </button>
                <button
                  type='button'
                  class={`flex-1 rounded-sm py-1.5 text-xs transition-colors ${imageMode === 'url'
                      ? 'bg-white text-[hsl(var(--foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  onClick={() => setImageMode('url')}
                >
                  <span class='inline-flex items-center gap-1.5'>
                    <Link class='h-3 w-3' /> URL
                  </span>
                </button>
              </div>

              {imageMode === 'upload' ? (
                <label class='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-6 transition-colors hover:border-black/50'>
                  <ImageIcon class='h-8 w-8 text-[hsl(var(--muted-foreground))]' />
                  <span class='text-sm text-[hsl(var(--muted-foreground))]'>Click to upload</span>
                  <input type='file' accept='image/*' class='hidden' onChange={handleImageUpload} />
                </label>
              ) : (
                <div class='space-y-2'>
                  <Input
                    placeholder='https://example.com/image.jpg'
                    value={imageUrl}
                    onInput={(event) => setImageUrl((event.target as HTMLInputElement).value)}
                    class='h-8 text-sm'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    class='w-full'
                    disabled={!imageUrl.trim()}
                    onClick={() => onChange({ featuredImage: imageUrl.trim() })}
                  >
                    Set Image
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div class='space-y-3 rounded-lg border border-[hsl(var(--border))] p-4'>
          <Label>Categories</Label>
          <div class='relative'>
            <Search class='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]' />
            <Input
              placeholder='Search categories...'
              value={categorySearch}
              onInput={(event) => setCategorySearch((event.target as HTMLInputElement).value)}
              class='h-8 pl-8 text-sm'
            />
          </div>
          <div class='max-h-40 space-y-1.5 overflow-y-auto'>
            {filteredCategories.map((category) => (
              <div key={category} class='flex items-center space-x-2'>
                <Checkbox
                  id={category}
                  checked={(course.categories || []).includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={category} class='text-sm font-normal'>
                  {category}
                </Label>
              </div>
            ))}
          </div>
          {categorySearch && !allCategories.includes(categorySearch) && (
            <Button variant='ghost' size='sm' onClick={addCategory} class='w-full text-xs'>
              <Plus class='mr-1 h-3 w-3' /> Add "{categorySearch}"
            </Button>
          )}
        </div>

        <div class='space-y-3 rounded-lg border border-[hsl(var(--border))] p-4'>
          <Label>Tags</Label>
          <div class='flex flex-wrap gap-1.5'>
            {(course.tags || []).map((tag) => (
              <Badge key={tag} variant='secondary' class='gap-1'>
                {tag}
                <X class='h-3 w-3 cursor-pointer' onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
          <div class='flex gap-2'>
            <Input
              placeholder='Add tag...'
              value={tagInput}
              onInput={(event) => setTagInput((event.target as HTMLInputElement).value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTag()
                }
              }}
              class='h-8 text-sm'
            />
            <Button variant='outline' size='sm' onClick={addTag} type='button'>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
