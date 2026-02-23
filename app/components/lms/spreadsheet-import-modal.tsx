import { useCallback, useState } from 'hono/jsx'

import { parseSpreadsheetData, type ParseResult } from '@/lib/parse-spreadsheet'
import { bulkImportTopicsAndLessons, generateSlug } from '@/lib/lms-storage'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  X,
} from '@/components/lms/icons'

interface SpreadsheetImportModalProps {
  courseId: string
  onClose: () => void
}

export function SpreadsheetImportModal({ courseId, onClose }: SpreadsheetImportModalProps) {
  const [rawText, setRawText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const handleParse = useCallback(() => {
    if (!rawText.trim()) return
    const result = parseSpreadsheetData(rawText)
    setParseResult(result)
    setExpandedTopics(new Set(result.topics.map((_, index) => index)))
  }, [rawText])

  const handlePaste = useCallback((event: ClipboardEvent) => {
    setTimeout(() => {
      const textarea = event.target as HTMLTextAreaElement
      const result = parseSpreadsheetData(textarea.value)
      setParseResult(result)
      setExpandedTopics(new Set(result.topics.map((_, index) => index)))
    }, 0)
  }, [])

  const toggleTopic = (index: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleImport = async () => {
    if (!parseResult || parseResult.topics.length === 0) return
    setImporting(true)

    try {
      const topics = parseResult.topics.map((parsedTopic) => ({
        title: parsedTopic.title,
        lessons: parsedTopic.lessons.map((lesson) => ({
          title: lesson.title,
          slug: generateSlug(lesson.title),
          videoUrl: lesson.youtubeUrl,
          videoPlaybackHours: lesson.durationHours,
          videoPlaybackMinutes: lesson.durationMinutes,
          videoPlaybackSeconds: lesson.durationSeconds,
        })),
      }))

      await bulkImportTopicsAndLessons(courseId, topics)

      setImported(true)
      toast({
        title: 'Import berhasil!',
        description: `${parseResult.topics.length} topik dan ${parseResult.totalLessons} lesson berhasil diimport.`,
        variant: 'success',
      })

      setTimeout(() => onClose(), 800)
    } catch {
      toast({
        title: 'Gagal import',
        description: 'Terjadi kesalahan saat import data.',
        variant: 'error',
      })
    } finally {
      setImporting(false)
    }
  }

  const formatDuration = (hours: number, minutes: number, seconds: number) => {
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div class='fixed inset-0 z-50 flex items-center justify-center'>
      <div class='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

      <div class='relative mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-[hsl(var(--border))] bg-white shadow-2xl'>
        <div class='flex items-center justify-between border-b border-[hsl(var(--border))] p-5'>
          <div class='flex items-center gap-3'>
            <div class='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
              <FileSpreadsheet class='h-5 w-5 text-emerald-500' />
            </div>
            <div>
              <h2 class='text-lg font-semibold'>Import dari Spreadsheet</h2>
              <p class='text-xs text-[hsl(var(--muted-foreground))]'>
                Copy data dari Google Sheets / Excel lalu paste di bawah
              </p>
            </div>
          </div>
          <Button variant='ghost' size='icon' onClick={onClose} class='h-8 w-8'>
            <X class='h-4 w-4' />
          </Button>
        </div>

        <div class='flex-1 space-y-4 overflow-y-auto p-5'>
          <div class='space-y-1.5 rounded-lg bg-[hsl(var(--muted))]/50 p-3 text-sm'>
            <p class='font-medium text-[hsl(var(--foreground))]'>Format kolom yang diharapkan:</p>
            <div class='flex flex-wrap gap-2'>
              {['topic', 'lesson_title', 'youtube_url', 'duration'].map((column, index) => (
                <span
                  key={column}
                  class='inline-flex items-center gap-1 rounded border border-[hsl(var(--border))] bg-white px-2 py-0.5 font-mono text-xs'
                >
                  <span class='text-[hsl(var(--muted-foreground))]'>
                    {String.fromCharCode(65 + index)}:
                  </span>
                  {column}
                </span>
              ))}
            </div>
            <p class='text-xs text-[hsl(var(--muted-foreground))]'>
              Baris header akan otomatis dilewati. Duration format: <code class='rounded bg-white px-1'>m:ss</code>{' '}
              atau <code class='rounded bg-white px-1'>h:mm:ss</code>
            </p>
          </div>

          <div class='space-y-2'>
            <label class='text-sm font-medium'>Paste data spreadsheet:</label>
            <textarea
              class='h-36 w-full resize-none rounded-lg border border-[hsl(var(--border))] bg-white p-3 font-mono text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30'
              placeholder={
                "PENGANTAR\tPembahasan Terkait Lahn Khafiy\thttps://youtu.be/wIl9SAPZMYs\t1:10\nPENGANTAR\tMembaca Al-Qur'an Menggunakan Nada-Nada\thttps://youtu.be/NREUHHfo17I\t18:38"
              }
              value={rawText}
              onInput={(event) => setRawText((event.target as HTMLTextAreaElement).value)}
              onPaste={handlePaste}
              autoFocus
            />
            {rawText && !parseResult && (
              <Button size='sm' onClick={handleParse} class='gap-1.5'>
                <Upload class='h-3.5 w-3.5' /> Parse Data
              </Button>
            )}
          </div>

          {parseResult && parseResult.errors.length > 0 && (
            <div class='space-y-1 rounded-lg border border-red-400/30 bg-red-500/10 p-3'>
              <div class='flex items-center gap-2 text-sm font-medium text-red-600'>
                <AlertCircle class='h-4 w-4' />
                {parseResult.errors.length} peringatan
              </div>
              <div class='max-h-24 space-y-0.5 overflow-y-auto'>
                {parseResult.errors.map((error, index) => (
                  <p key={index} class='text-xs text-red-700/90'>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {parseResult && parseResult.topics.length > 0 && (
            <div class='space-y-2'>
              <div class='flex items-center justify-between'>
                <h3 class='flex items-center gap-2 text-sm font-semibold'>
                  <CheckCircle2 class='h-4 w-4 text-emerald-500' />
                  Preview: {parseResult.topics.length} topik, {parseResult.totalLessons} lesson
                </h3>
              </div>

              <div class='divide-y divide-[hsl(var(--border))] overflow-hidden rounded-lg border border-[hsl(var(--border))]'>
                {parseResult.topics.map((topic, topicIndex) => {
                  const isExpanded = expandedTopics.has(topicIndex)
                  return (
                    <div key={topicIndex}>
                      <button
                        class='flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--muted))]/50'
                        onClick={() => toggleTopic(topicIndex)}
                      >
                        {isExpanded ? (
                          <ChevronDown class='h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]' />
                        ) : (
                          <ChevronRight class='h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]' />
                        )}
                        <span class='flex-1 text-sm font-medium'>{topic.title}</span>
                        <span class='rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]'>
                          {topic.lessons.length} lessons
                        </span>
                      </button>

                      {isExpanded && (
                        <div class='space-y-1 bg-[hsl(var(--muted))]/20 px-3 pb-2'>
                          {topic.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              class='flex items-center gap-3 rounded-md bg-white px-3 py-1.5 text-sm'
                            >
                              <span class='w-5 shrink-0 text-right font-mono text-xs text-[hsl(var(--muted-foreground))]'>
                                {lessonIndex + 1}.
                              </span>
                              <span class='flex-1 truncate'>{lesson.title}</span>
                              <span class='shrink-0 font-mono text-xs text-[hsl(var(--muted-foreground))]'>
                                {formatDuration(
                                  lesson.durationHours,
                                  lesson.durationMinutes,
                                  lesson.durationSeconds
                                )}
                              </span>
                              {lesson.youtubeUrl && (
                                <span class='shrink-0 text-[10px] font-medium text-red-400'>YT</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div class='flex items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5'>
          <Button variant='outline' onClick={onClose} disabled={importing}>
            Batal
          </Button>
          <Button
            onClick={() => void handleImport()}
            disabled={!parseResult || parseResult.topics.length === 0 || importing || imported}
            class='gap-2'
          >
            {imported ? (
              <>
                <CheckCircle2 class='h-4 w-4' /> Berhasil!
              </>
            ) : importing ? (
              'Importing...'
            ) : (
              <>
                <Upload class='h-4 w-4' /> Import {parseResult ? `${parseResult.totalLessons} Lessons` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
