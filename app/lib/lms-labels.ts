import type { Course, Lesson, UserRole } from '@/types/lms'

const difficultyLabels: Record<Course['difficultyLevel'], string> = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Lanjutan',
}

const visibilityLabels: Record<Course['visibility'], string> = {
  public: 'Publik',
  private: 'Privat',
}

const pricingLabels: Record<Course['pricingModel'], string> = {
  free: 'Gratis',
  paid: 'Berbayar',
}

const statusLabels: Record<Course['status'], string> = {
  draft: 'Draf',
  published: 'Dipublikasikan',
}

const previewTypeLabels: Record<Lesson['previewType'], string> = {
  free: 'GRATIS',
  pro: 'PRO',
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'Pengguna',
}

export function getDifficultyLabel(value: Course['difficultyLevel']): string {
  return difficultyLabels[value]
}

export function getVisibilityLabel(value: Course['visibility']): string {
  return visibilityLabels[value]
}

export function getPricingLabel(value: Course['pricingModel']): string {
  return pricingLabels[value]
}

export function getStatusLabel(value: Course['status']): string {
  return statusLabels[value]
}

export function getPreviewTypeLabel(value: Lesson['previewType']): string {
  return previewTypeLabels[value]
}

export function getRoleLabel(value: UserRole): string {
  return roleLabels[value]
}
