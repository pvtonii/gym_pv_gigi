'use client'

import { useState, useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ExerciseCard, type ExerciseValues } from '@/components/ExerciseCard'
import { RestTimer } from '@/components/RestTimer'
import { saveLog } from '@/lib/actions/save-log'
import { logout } from '@/lib/auth'
import { useSession } from '@/components/SessionProvider'
import type { WorkoutDay, WorkoutLog } from '@/types'

interface WorkoutDayClientProps {
  workoutDay: WorkoutDay
  myLastLogs: Record<string, WorkoutLog>
  otherLastLogs: Record<string, WorkoutLog>
  myPRs: Record<string, number>
  otherPRs: Record<string, number>
  otherName: string
}

export function WorkoutDayClient({
  workoutDay,
  myLastLogs,
  otherLastLogs,
  myPRs,
  otherPRs,
  otherName,
}: WorkoutDayClientProps) {
  const session = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState<Record<string, ExerciseValues>>(
    () =>
      Object.fromEntries(
        workoutDay.exercises.map((e) => [e.key, { weight: '', sets: '', reps: '' }])
      )
  )
  const [completedToday, setCompletedToday] = useState(false)

  function handleChange(key: string, newValues: ExerciseValues) {
    setValues((prev) => ({ ...prev, [key]: newValues }))
  }

  async function handleSave() {
    const toSave = workoutDay.exercises.filter(
      (e) => values[e.key]?.weight || values[e.key]?.sets || values[e.key]?.reps
    )
    if (toSave.length === 0) {
      toast.error('Fill in at least one exercise before saving.')
      return
    }

    startTransition(async () => {
      let saved = 0
      for (const exercise of toSave) {
        const v = values[exercise.key]
        const result = await saveLog({
          day: workoutDay.day,
          exercise_key: exercise.key,
          weight: v.weight ? parseFloat(v.weight) : null,
          reps: v.reps ? parseInt(v.reps) : null,
          sets: v.sets ? parseInt(v.sets) : null,
        })
        if (result.success) saved++
      }

      if (saved > 0) {
        toast.success(`${saved} exercise${saved > 1 ? 's' : ''} saved! 💪`)
        const allFilled = workoutDay.exercises.every((e) => values[e.key]?.weight)
        if (allFilled) setCompletedToday(true)
        router.refresh()
      } else {
        toast.error('Error saving. Please try again.')
      }
    })
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <>
      {/* Topbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          height: 'calc(56px + env(safe-area-inset-top))',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              GYM
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
            >
              {workoutDay.split}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {workoutDay.muscles}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
          >
            {session.name}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div
        className="px-4 py-4 space-y-4"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)' }}
      >
        {/* Day header */}
        <div className="pt-1 pb-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {workoutDay.label}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {workoutDay.split} · {workoutDay.muscles}
          </p>
        </div>

        {/* Completion banner */}
        {completedToday && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-medium"
            style={{ background: '#f0fdf4', color: 'var(--success)', border: '1px solid #bbf7d0' }}
          >
            Workout complete! 💪 Great work, {session.name}!
          </div>
        )}

        {/* Exercise cards */}
        {workoutDay.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.key}
            exercise={exercise}
            myLastLog={myLastLogs[exercise.key] ?? null}
            otherLastLog={otherLastLogs[exercise.key] ?? null}
            myPr={myPRs[exercise.key] ?? null}
            otherPr={otherPRs[exercise.key] ?? null}
            myName={session.name}
            otherName={otherName}
            values={values[exercise.key]}
            onChange={handleChange}
          />
        ))}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full h-13 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: 'var(--text)',
            color: '#ffffff',
            height: 52,
          }}
        >
          {isPending ? 'Saving…' : 'Save Workout'}
        </button>
      </div>

      {/* Rest Timer FAB */}
      <RestTimer />
    </>
  )
}
