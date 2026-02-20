import { cn } from '@/lib/cn'

type IconProps = {
  class?: string
  [key: string]: unknown
}

function createIcon(pathD: string) {
  return function Icon(props: IconProps) {
    const { class: className, ...rest } = props
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={cn('h-4 w-4', className)}
        {...rest}
      >
        <path d={pathD} />
      </svg>
    )
  }
}

export const Plus = createIcon('M12 5v14M5 12h14')
export const Search = createIcon('m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z')
export const BookOpen = createIcon('M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4h13.5A2.5 2.5 0 0 1 20 6.5V20H6.5A2.5 2.5 0 0 1 4 17.5V4Z')
export const LogOut = createIcon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')
export const Users = createIcon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 3.13a4 4 0 0 1 0 7.75M23 21v-2a4 4 0 0 0-3-3.87M9 11A4 4 0 1 0 9 3a4 4 0 0 0 0 8Z')
export const Shield = createIcon('M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3Z')
export const ArrowLeft = createIcon('m12 19-7-7 7-7M19 12H5')
export const ArrowRight = createIcon('m12 5 7 7-7 7M5 12h14')
export const Edit = createIcon('M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z')
export const Share2 = createIcon('M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 16V3M7 8l5-5 5 5')
export const Award = createIcon('M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Zm0 6.5 2 1 1-2 1 2 2-1-1 2 2 1.5-2 .5v2l-2-1-2 1v-2l-2-.5 2-1.5-1-2Z')
export const Eye = createIcon('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z')
export const Video = createIcon('M23 7l-7 5 7 5V7ZM15 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z')
export const Clock = createIcon('M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z')
export const ImageIcon = createIcon('m21 15-5-5L5 21M3 5h18v14H3V5Zm5 3h.01')
export const GraduationCap = createIcon('M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1 3 3 6 3s6-2 6-3v-5')
export const BarChart3 = createIcon('M3 3v18h18M18 17V9M13 17V5M8 17v-3')
export const User = createIcon('M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z')
export const PlayCircle = createIcon('M10 8l6 4-6 4V8ZM12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z')
export const ChevronDown = createIcon('m6 9 6 6 6-6')
export const ChevronRight = createIcon('m9 6 6 6-6 6')
export const CheckCircle2 = createIcon('m9 12 2 2 4-4M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z')
export const StickyNote = createIcon('M4 4h16v12l-4 4H4V4Zm12 12h4')
export const Menu = createIcon('M3 6h18M3 12h18M3 18h18')
export const PanelLeftClose = createIcon('M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 8l-4 4 4 4M21 3v18')
export const PanelLeft = createIcon('M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M21 3v18')
export const MoreVertical = createIcon('M12 5h.01M12 12h.01M12 19h.01')
export const Trash2 = createIcon('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6')
export const X = createIcon('M18 6 6 18M6 6l12 12')
export const Upload = createIcon('M12 16V4M7 9l5-5 5 5M4 20h16')
export const Film = createIcon('M3 5h18v14H3V5Zm4 0v14M17 5v14M3 9h18M3 15h18')
export const HelpCircle = createIcon('M9 9a3 3 0 1 1 4.5 2.6c-1.1.6-1.5 1-1.5 2.4M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z')
export const Gamepad2 = createIcon('M6 12h4M8 10v4M16 12h.01M18 10h.01M6 18l-2-6a4 4 0 0 1 4-5h8a4 4 0 0 1 4 5l-2 6a2 2 0 0 1-3 1l-2-2h-2l-2 2a2 2 0 0 1-3-1Z')
export const ClipboardList = createIcon('M9 5h6M9 9h6M9 13h6M4 4h16v16H4V4Zm2-2h12v2H6V2Z')
export const ChevronsDownUp = createIcon('m7 20 5-5 5 5M7 4l5 5 5-5')
export const Pencil = createIcon('M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z')
export const GripVertical = createIcon('M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01')
export const FileSpreadsheet = createIcon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h8M8 9h8M8 9v8M12 9v8M16 9v8')
export const AlertCircle = createIcon('M12 8v4M12 16h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z')
export const Check = createIcon('m5 13 4 4L19 7')
export const Save = createIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8')
export const Link = createIcon('m10 13 4-4M7 17a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1 1M17 7a4 4 0 0 1 0 6l-3 3a4 4 0 1 1-6-6l1-1')
export const UserPlus = createIcon('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 0v6m3-3h-6')
export const LogIn = createIcon('m15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3')
export const Bold = createIcon('M6 4h7a4 4 0 0 1 0 8H6zm0 8h8a4 4 0 0 1 0 8H6z')
export const Italic = createIcon('M10 4h8M6 20h8M14 4 10 20')
export const Underline = createIcon('M7 4v6a5 5 0 0 0 10 0V4M5 20h14')
export const List = createIcon('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01')
export const ListOrdered = createIcon('M10 6h11M10 12h11M10 18h11M4 6h1v4M4 18h2l-2 2h2')
export const AlignLeft = createIcon('M3 6h18M3 12h12M3 18h18')
export const AlignCenter = createIcon('M3 6h18M6 12h12M3 18h18')
export const AlignRight = createIcon('M3 6h18M9 12h12M3 18h18')
export const Code = createIcon('m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14')
