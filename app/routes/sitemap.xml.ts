import { createRoute } from 'honox/factory'

import { resolveSiteUrl } from '@/lib/seo'
import { listCourses, listLessonsByTopic, listTopicsByCourse } from '@/lib/server/lms-store'

type SitemapEntry = {
  path: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIso(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

export default createRoute(async (c) => {
  const siteUrl = resolveSiteUrl(c)
  const entries = new Map<string, SitemapEntry>()

  const upsert = (entry: SitemapEntry) => {
    const previous = entries.get(entry.path)
    if (!previous) {
      entries.set(entry.path, entry)
      return
    }

    entries.set(entry.path, {
      path: entry.path,
      changefreq: previous.changefreq || entry.changefreq,
      priority: previous.priority || entry.priority,
      lastmod: previous.lastmod || entry.lastmod,
    })
  }

  upsert({ path: '/', changefreq: 'daily', priority: '1.0' })
  upsert({ path: '/login', changefreq: 'weekly', priority: '0.7' })

  const courses = await listCourses(c.env.LMS_DB)
  for (const course of courses) {
    const encodedCourseSlug = encodeURIComponent(course.slug)
    upsert({
      path: `/courses/${encodedCourseSlug}`,
      lastmod: toIso(course.updatedAt),
      changefreq: 'daily',
      priority: '0.9',
    })
    upsert({
      path: `/courses/${encodedCourseSlug}/lessons`,
      lastmod: toIso(course.updatedAt),
      changefreq: 'daily',
      priority: '0.8',
    })

    const topics = await listTopicsByCourse(c.env.LMS_DB, course.id)
    for (const topic of topics) {
      const lessons = await listLessonsByTopic(c.env.LMS_DB, topic.id)
      for (const lesson of lessons) {
        upsert({
          path: `/courses/${encodedCourseSlug}/lessons/${encodeURIComponent(lesson.slug)}`,
          lastmod: toIso(lesson.updatedAt),
          changefreq: 'weekly',
          priority: '0.7',
        })
      }
    }
  }

  const urls = Array.from(entries.values())
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`,
      ]

      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`)
      }
      if (entry.changefreq) {
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      }
      if (entry.priority) {
        lines.push(`    <priority>${entry.priority}</priority>`)
      }

      lines.push('  </url>')
      return lines.join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')

  c.header('content-type', 'application/xml; charset=utf-8')
  c.header('cache-control', 'public, max-age=3600')
  return c.body(xml)
})
