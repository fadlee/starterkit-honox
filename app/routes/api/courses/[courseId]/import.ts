import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { generateSlug } from '@/lib/server/lms-payloads'
import {
    bulkImportTopicsAndLessons,
    getCourseById,
} from '@/lib/server/lms-store'
import type { BulkImportTopic } from '@/lib/server/lms-store'
import {
    badRequest,
    handleApiError,
    notFound,
    readJsonBody,
    setNoStore,
} from '@/lib/server/api-utils'

interface ImportTopicPayload {
    title: string
    lessons: {
        title: string
        slug?: string
        content?: string
        featuredImage?: string
        videoUrl?: string
        videoPlaybackHours?: number
        videoPlaybackMinutes?: number
        videoPlaybackSeconds?: number
        exerciseFiles?: string[]
        isPreview?: boolean
        previewType?: 'free' | 'pro'
    }[]
}

interface ImportPayload {
    topics: ImportTopicPayload[]
}

function parseImportPayload(body: Record<string, unknown>): BulkImportTopic[] {
    const rawTopics = body.topics
    if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
        badRequest('topics array is required and must not be empty')
    }

    return rawTopics.map((rawTopic: unknown, topicIndex: number) => {
        if (!rawTopic || typeof rawTopic !== 'object') {
            badRequest(`topics[${topicIndex}] must be an object`)
        }

        const topic = rawTopic as Record<string, unknown>
        const title = typeof topic.title === 'string' ? topic.title.trim() : ''
        if (!title) {
            badRequest(`topics[${topicIndex}].title is required`)
        }

        const rawLessons = topic.lessons
        if (!Array.isArray(rawLessons)) {
            badRequest(`topics[${topicIndex}].lessons must be an array`)
        }

        const lessons = rawLessons.map((rawLesson: unknown, lessonIndex: number) => {
            if (!rawLesson || typeof rawLesson !== 'object') {
                badRequest(`topics[${topicIndex}].lessons[${lessonIndex}] must be an object`)
            }

            const lesson = rawLesson as Record<string, unknown>
            const lessonTitle = typeof lesson.title === 'string' ? lesson.title.trim() : ''
            if (!lessonTitle) {
                badRequest(`topics[${topicIndex}].lessons[${lessonIndex}].title is required`)
            }

            return {
                title: lessonTitle,
                slug: typeof lesson.slug === 'string' && lesson.slug.trim()
                    ? lesson.slug.trim()
                    : generateSlug(lessonTitle),
                content: typeof lesson.content === 'string' ? lesson.content : '',
                featuredImage: typeof lesson.featuredImage === 'string' ? lesson.featuredImage : '',
                videoUrl: typeof lesson.videoUrl === 'string' ? lesson.videoUrl : '',
                videoPlaybackHours: typeof lesson.videoPlaybackHours === 'number' ? lesson.videoPlaybackHours : 0,
                videoPlaybackMinutes: typeof lesson.videoPlaybackMinutes === 'number' ? lesson.videoPlaybackMinutes : 0,
                videoPlaybackSeconds: typeof lesson.videoPlaybackSeconds === 'number' ? lesson.videoPlaybackSeconds : 0,
                exerciseFiles: Array.isArray(lesson.exerciseFiles)
                    ? lesson.exerciseFiles.filter((f: unknown): f is string => typeof f === 'string')
                    : [],
                isPreview: typeof lesson.isPreview === 'boolean' ? lesson.isPreview : false,
                previewType: (lesson.previewType === 'pro' ? 'pro' : 'free') as 'free' | 'pro',
            }
        })

        return { title, lessons }
    })
}

export const POST = createRoute(async (c) => {
    try {
        await requireAdmin(c)
        setNoStore(c)

        const courseId = c.req.param('courseId')
        if (!courseId) {
            notFound('course not found')
        }

        const course = await getCourseById(c.env.LMS_DB, courseId)
        if (!course) {
            notFound('course not found')
        }

        const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
        const importTopics = parseImportPayload(body)

        const result = await bulkImportTopicsAndLessons(c.env.LMS_DB, courseId, importTopics)

        return c.json(result, 201)
    } catch (error) {
        return handleApiError(c, error)
    }
})
