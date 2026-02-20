export interface ParsedLesson {
    title: string;
    youtubeUrl: string;
    durationHours: number;
    durationMinutes: number;
    durationSeconds: number;
}

export interface ParsedTopic {
    title: string;
    lessons: ParsedLesson[];
}

export interface ParseResult {
    topics: ParsedTopic[];
    errors: string[];
    totalLessons: number;
}

/**
 * Parse a duration string like "1:10", "18:38", "1:14:00" into hours, minutes, seconds.
 */
function parseDuration(raw: string): { hours: number; minutes: number; seconds: number } {
    const trimmed = raw.trim();
    if (!trimmed) return { hours: 0, minutes: 0, seconds: 0 };

    const parts = trimmed.split(':').map(p => parseInt(p, 10));

    if (parts.some(isNaN)) return { hours: 0, minutes: 0, seconds: 0 };

    if (parts.length === 3) {
        return { hours: parts[0], minutes: parts[1], seconds: parts[2] };
    }
    if (parts.length === 2) {
        return { hours: 0, minutes: parts[0], seconds: parts[1] };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
}

/**
 * Detect if a row is a header row by checking common header labels.
 */
function isHeaderRow(cells: string[]): boolean {
    const headerKeywords = ['topic', 'lesson_title', 'lesson', 'youtube_url', 'youtube', 'duration', 'url', 'judul'];
    const lower = cells.map(c => c.toLowerCase().trim());
    return lower.some(c => headerKeywords.includes(c));
}

/**
 * Parse tab-separated spreadsheet text into structured topic/lesson data.
 *
 * Expected columns (by position):
 *   0: topic name
 *   1: lesson title  (column B or C — we detect based on content)
 *   2: youtube URL (or column after lesson title)
 *   3: duration (e.g. "1:10")
 *   4: duration_in_seconds (optional, fallback)
 *
 * If there's an empty column B (common when spreadsheet has merged cells),
 * we shift detection accordingly.
 */
export function parseSpreadsheetData(text: string): ParseResult {
    const errors: string[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        return { topics: [], errors: ['Data kosong. Paste data dari spreadsheet.'], totalLessons: 0 };
    }

    // Detect columns from first data line
    let startIndex = 0;
    const firstCells = lines[0].split('\t');
    if (isHeaderRow(firstCells)) {
        startIndex = 1;
    }

    // Detect column mapping from the first line
    // The spreadsheet image shows: A=topic, B=(empty or label), C=lesson_title, D=youtube_url, E=duration, F=duration_in_seconds
    // But when copy-pasting, it could be: topic \t lesson_title \t youtube_url \t duration \t duration_in_seconds
    // We need to handle both cases

    const topicMap = new Map<string, ParsedLesson[]>();
    const topicOrder: string[] = [];

    for (let i = startIndex; i < lines.length; i++) {
        const cells = lines[i].split('\t').map(c => c.trim());
        const lineNum = i + 1;

        if (cells.length < 3) {
            errors.push(`Baris ${lineNum}: Kolom tidak lengkap (minimal: topic, lesson_title, youtube_url)`);
            continue;
        }

        // Find the column indices
        // Strategy: find the youtube URL column first, then work backwards
        let topicCol = 0;
        let lessonCol = 1;
        let urlCol = 2;
        let durationCol = 3;

        // Find the youtube URL column
        const youtubeColIdx = cells.findIndex(c => c.includes('youtu.be') || c.includes('youtube.com'));
        if (youtubeColIdx >= 0) {
            urlCol = youtubeColIdx;
            lessonCol = urlCol - 1;
            topicCol = 0;
            durationCol = urlCol + 1;
        }

        const topicTitle = cells[topicCol];
        const lessonTitle = cells[lessonCol];
        const youtubeUrl = cells[urlCol] || '';
        const durationStr = cells[durationCol] || '';

        if (!topicTitle) {
            errors.push(`Baris ${lineNum}: Topic kosong`);
            continue;
        }
        if (!lessonTitle) {
            errors.push(`Baris ${lineNum}: Judul lesson kosong`);
            continue;
        }

        const duration = parseDuration(durationStr);

        const lesson: ParsedLesson = {
            title: lessonTitle,
            youtubeUrl,
            durationHours: duration.hours,
            durationMinutes: duration.minutes,
            durationSeconds: duration.seconds,
        };

        if (!topicMap.has(topicTitle)) {
            topicMap.set(topicTitle, []);
            topicOrder.push(topicTitle);
        }
        topicMap.get(topicTitle)!.push(lesson);
    }

    const topics: ParsedTopic[] = topicOrder.map(title => ({
        title,
        lessons: topicMap.get(title)!,
    }));

    const totalLessons = topics.reduce((sum, t) => sum + t.lessons.length, 0);

    return { topics, errors, totalLessons };
}
