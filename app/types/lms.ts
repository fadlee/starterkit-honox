export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  visibility: 'public' | 'private';
  featuredImage: string;
  pricingModel: 'free' | 'paid';
  categories: string[];
  tags: string[];
  author: string;
  isScheduled: boolean;
  scheduleDate: string;
  isPublicCourse: boolean;
  maxStudents: number;
  certificate: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  courseId: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  videoUrl: string;
  videoPlaybackHours: number;
  videoPlaybackMinutes: number;
  videoPlaybackSeconds: number;
  exerciseFiles: string[];
  isPreview: boolean;
  previewType: 'free' | 'pro';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessons: string[];
  notes: Record<string, string>;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export const DEFAULT_CATEGORIES = [
  'Adab', 'Alquran', 'Bahasa Arab', 'Fiqih', 'Hadits',
  'Sejarah Islam', 'Tafsir', 'Tajwid', 'Tauhid', 'Ushul Fiqih'
];

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;
