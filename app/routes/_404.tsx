import type { NotFoundHandler } from 'hono'

const buttonBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]'

const buttonPrimary =
  'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:shadow-md hover:bg-[hsl(var(--primary))]/90 h-10 px-4 py-2'

const buttonOutline =
  'border border-[hsl(var(--border))] bg-transparent shadow-sm hover:shadow-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] h-10 px-4 py-2'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render(
    <div class="min-h-[70vh] flex items-center justify-center px-4">
      <div class="text-center">
        <div class="mb-4">
          <span class="text-[120px] sm:text-[160px] font-bold text-[hsl(var(--primary))] leading-none">
            404
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p class="text-[hsl(var(--muted-foreground))] mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" class={`${buttonBase} ${buttonPrimary}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m3 9 9-7 9 7v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <path d="M9 22V12h6v10" />
            </svg>
            Kembali ke Beranda
          </a>
          <a href="javascript:history.back()" class={`${buttonBase} ${buttonOutline}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Halaman Sebelumnya
          </a>
        </div>
      </div>
    </div>
  )
}

export default handler
