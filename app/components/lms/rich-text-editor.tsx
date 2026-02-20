import { useRef, useState } from 'hono/jsx'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eye,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
} from '@/components/lms/icons'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content...',
  minHeight = '200px',
}: RichTextEditorProps) {
  const [isCodeView, setIsCodeView] = useState(false)
  const editorRef = useRef<HTMLDivElement | null>(null)

  const execCommand = (command: string, commandValue?: string) => {
    if (typeof document === 'undefined') return
    document.execCommand(command, false, commandValue)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleLink = () => {
    if (typeof window === 'undefined') return
    const url = window.prompt('Enter URL:')
    if (url) execCommand('createLink', url)
  }

  return (
    <div class='overflow-hidden rounded-md border border-[hsl(var(--border))]'>
      <div class='flex flex-wrap items-center gap-0.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-1.5'>
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('bold')} type='button'>
          <Bold class='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('italic')} type='button'>
          <Italic class='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('underline')} type='button'>
          <Underline class='h-3.5 w-3.5' />
        </Button>
        <div class='mx-1 h-5 w-px bg-[hsl(var(--border))]' />
        <Button
          variant='ghost'
          size='icon'
          class='h-7 w-7'
          onClick={() => execCommand('insertUnorderedList')}
          type='button'
        >
          <List class='h-3.5 w-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          class='h-7 w-7'
          onClick={() => execCommand('insertOrderedList')}
          type='button'
        >
          <ListOrdered class='h-3.5 w-3.5' />
        </Button>
        <div class='mx-1 h-5 w-px bg-[hsl(var(--border))]' />
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('justifyLeft')} type='button'>
          <AlignLeft class='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('justifyCenter')} type='button'>
          <AlignCenter class='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={() => execCommand('justifyRight')} type='button'>
          <AlignRight class='h-3.5 w-3.5' />
        </Button>
        <div class='mx-1 h-5 w-px bg-[hsl(var(--border))]' />
        <Button variant='ghost' size='icon' class='h-7 w-7' onClick={handleLink} type='button'>
          <Link class='h-3.5 w-3.5' />
        </Button>
        <div class='ml-auto flex gap-1'>
          <Toggle
            size='sm'
            pressed={!isCodeView}
            onPressedChange={() => setIsCodeView(false)}
            class='h-7 gap-1 px-2 text-xs'
          >
            <Eye class='h-3 w-3' /> Visual
          </Toggle>
          <Toggle
            size='sm'
            pressed={isCodeView}
            onPressedChange={() => setIsCodeView(true)}
            class='h-7 gap-1 px-2 text-xs'
          >
            <Code class='h-3 w-3' /> Code
          </Toggle>
        </div>
      </div>

      {isCodeView ? (
        <Textarea
          value={value}
          onChange={(event) => onChange((event.target as HTMLTextAreaElement).value)}
          class='resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0'
          style={{ minHeight }}
          placeholder='<p>HTML content here...</p>'
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          class='lms-prose max-w-none p-3 outline-none'
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={() => {
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML)
            }
          }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  )
}
