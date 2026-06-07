'use client'

import { useState, useTransition } from 'react'
import { LogOut, Eye, EyeOff } from 'lucide-react'
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
  const [viewingOther, setViewingOther] = useState(false)
  const [values, setValues] = useState<Record<string, ExerciseValues>>(
    () =>
      Object.fromEntries(
        workoutDay.exercises.map((e) => [
          e.key,
          { weight: '', sets: '', reps: '' },
        ])
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
      toast.error('Preencha pelo menos um exercício antes de salvar.')
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
        toast.success(`${saved} exercício${saved > 1 ? 's' : ''} salvo${saved > 1 ? 's' : ''}! 💪`)
        const allFilled = workoutDay.exercises.every(
          (e) => values[e.key]?.weight
        )
        if (allFilled) setCompletedToday(true)
        router.refresh()
      } else {
        toast.error('Erro ao salvar. Tente novamente.')
      }
    })
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const currentLastLogs = viewingOther ? otherLastLogs : myLastLogs
  const currentPRs = viewingOther ? otherPRs : myPRs

  return (
    <>
      {/* Topbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-black"
              style={{ color: 'var(--accent)' }}
            >
              GYM
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(0,229,255,0.12)', color: 'var(--accent)' }}
            >
              {workoutDay.split}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {workoutDay.muscles}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingOther((v) => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              background: viewingOther ? 'rgba(255,64,129,0.15)' : 'var(--card-alt)',
              color: viewingOther ? 'var(--accent-gi)' : 'var(--text-muted)',
              border: `1px solid ${viewingOther ? 'rgba(255,64,129,0.3)' : 'var(--border)'}`,
            }}
          >
            {viewingOther ? <EyeOff size={12} /> : <Eye size={12} />}
            {viewingOther ? otherName : session.name}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div
        className="px-4 py-4 space-y-4"
        style={{
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)',
        }}
      >
        {/* Header do dia */}
        <div className="text-center py-2">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
            {workoutDay.label}-feira
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {workoutDay.split} — {workoutDay.muscles}
          </p>
          {viewingOther && (
            <div
              className="mt-2 inline-block text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: 'rgba(255,64,129,0.12)', color: 'var(--accent-gi)' }}
            >
              Visualizando treino de {otherName}
            </div>
          )}
        </div>

        {/* Banner de conclusão */}
        {completedToday && (
          <div
            className="rounded-2xl p-4 text-center font-bold"
            style={{ background: 'rgba(0,230,118,0.12)', color: 'var(--success)' }}
          >
            Treino concluído! 💪 Excelente trabalho, {session.name}!
          </div>
        )}

        {/* Cards de exercício */}
        {workoutDay.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.key}
            exercise={exercise}
            lastLog={currentLastLogs[exercise.key] ?? null}
            pr={currentPRs[exercise.key] ?? null}
            readonly={viewingOther}
            ownerName={otherName}
            values={values[exercise.key]}
            onChange={handleChange}
          />
        ))}

        {/* Botão salvar */}
        {!viewingOther && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-98 disabled:opacity-60"
            style={{
              background: isPending ? 'var(--card-alt)' : 'var(--accent)',
              color: '#0d0f14',
            }}
          >
            {isPending ? 'Salvando…' : '💾 Salvar treino'}
          </button>
        )}
      </div>

      {/* Rest Timer FAB */}
      <RestTimer />
    </>
  )
}
