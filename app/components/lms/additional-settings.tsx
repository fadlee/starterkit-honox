import type { Course } from '@/types/lms'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Award, Clock, Users } from '@/components/lms/icons'

interface AdditionalSettingsProps {
  course: Partial<Course>
  onChange: (data: Partial<Course>) => void
}

export function AdditionalSettings({ course, onChange }: AdditionalSettingsProps) {
  return (
    <div class='grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader class='pb-3'>
          <CardTitle class='flex items-center gap-2 text-sm'>
            <Users class='h-4 w-4' /> Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent class='space-y-4'>
          <div class='space-y-2'>
            <Label htmlFor='max-students'>Maximum Students</Label>
            <Input
              id='max-students'
              type='number'
              min={0}
              value={course.maxStudents || 0}
              onInput={(event) => onChange({ maxStudents: +(event.target as HTMLInputElement).value })}
              placeholder='0 = unlimited'
            />
            <p class='text-xs text-[hsl(var(--muted-foreground))]'>Set 0 for unlimited</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class='pb-3'>
          <CardTitle class='flex items-center gap-2 text-sm'>
            <Award class='h-4 w-4' /> Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class='flex items-center justify-between'>
            <Label>Enable Certificate</Label>
            <Switch
              checked={course.certificate ?? false}
              onCheckedChange={(value) => onChange({ certificate: value })}
            />
          </div>
          <p class='mt-2 text-xs text-[hsl(var(--muted-foreground))]'>
            Award certificate upon course completion
          </p>
        </CardContent>
      </Card>

      <Card class='md:col-span-2'>
        <CardHeader class='pb-3'>
          <CardTitle class='flex items-center gap-2 text-sm'>
            <Clock class='h-4 w-4' /> Content Drip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class='text-sm text-[hsl(var(--muted-foreground))]'>
            Content drip settings will be available in a future update. This feature allows you to
            schedule the release of course content over time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
