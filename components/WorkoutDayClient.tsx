'use client'

import { useState, useTransition } from 'react'
import { LogOut, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExerciseCard, type ExerciseValues } from '@/components/ExerciseCard'
import { RestTimer } from '@/components/RestTimer'
import { saveLog } from '@/lib/actions/save-log'
import { getLastLogPerExercise } from '@/lib/actions/get-logs'
import { logout } from '@/lib/auth'
import { useSession } from '@/components/SessionProvider'
import { MOTIVATIONAL_PHRASES } from '@/lib/workout-data'
import { VERSION, VERSION_DATE } from '@/lib/version'
import type { WorkoutDay, WorkoutLog, UserId } from '@/types'

interface CustomEntry { name: string; key: string }

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'exercise'
}

function loadCustom(userId: string): Record<string, CustomEntry> {
  try {
    const raw = localStorage.getItem(`gym_custom_${userId}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveCustom(userId: string, data: Record<string, CustomEntry>) {
  localStorage.setItem(`gym_custom_${userId}`, JSON.stringify(data))
}

function getDailyPhrase() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return MOTIVATIONAL_PHRASES[seed % MOTIVATIONAL_PHRASES.length]
}

interface WorkoutDayClientProps {
  workoutDay: WorkoutDay
}

export function WorkoutDayClient({ workoutDay }: WorkoutDayClientProps) {
  const session = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState<Record<string, ExerciseValues>>(() => {
    const custom = typeof window !== 'undefined' ? loadCustom(session.id) : {}
    return Object.fromEntries(
      workoutDay.exercises.map((e) => [e.key, { weight: '', customName: custom[e.key]?.name ?? '' }])
    )
  })
  const [completedToday, setCompletedToday] = useState(false)

  const otherId: UserId = session.id === 'pv' ? 'gi' : 'pv'
  const otherName = otherId.toUpperCase()

  const { data: myLastLogs = {} } = useQuery({
    queryKey: ['logs', session.id],
    queryFn: () => getLastLogPerExercise('terca', session.id),
    staleTime: Infinity,
  })

  const { data: otherLastLogs = {}, isFetching: otherFetching } = useQuery({
    queryKey: ['logs', otherId],
    queryFn: () => getLastLogPerExercise('terca', otherId),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  })

  function handleChange(key: string, newValues: ExerciseValues) {
    setValues((prev) => ({ ...prev, [key]: newValues }))
  }

  function handleRefreshOther() {
    queryClient.invalidateQueries({ queryKey: ['logs', otherId] })
  }

  function getEffectiveKey(exerciseKey: string): string {
    const custom = loadCustom(session.id)
    return custom[exerciseKey]?.key ?? exerciseKey
  }

  async function handleSave() {
    const toSave = workoutDay.exercises.filter((e) => values[e.key]?.weight)
    if (toSave.length === 0) {
      toast.error('Preencha pelo menos um exercício antes de salvar.')
      return
    }

    startTransition(async () => {
      const custom = loadCustom(session.id)
      let saved = 0

      for (const exercise of toSave) {
        const v = values[exercise.key]
        const trimmedName = v.customName?.trim()

        // Derive the key to log under
        let effectiveKey: string
        if (trimmedName && trimmedName !== exercise.name) {
          effectiveKey = slugify(trimmedName)
          custom[exercise.key] = { name: trimmedName, key: effectiveKey }
        } else {
          effectiveKey = custom[exercise.key]?.key ?? exercise.key
        }

        const result = await saveLog({
          day: workoutDay.day,
          exercise_key: effectiveKey,
          weight: v.weight ? parseFloat(v.weight) : null,
          reps: null,
          sets: null,
        })
        if (result.success) saved++
      }

      saveCustom(session.id, custom)

      if (saved > 0) {
        toast.success(`${saved} exercício${saved > 1 ? 's' : ''} salvo${saved > 1 ? 's' : ''}! 💪`)
        const allFilled = workoutDay.exercises.every((e) => values[e.key]?.weight)
        if (allFilled) setCompletedToday(true)
        await queryClient.invalidateQueries({ queryKey: ['logs', session.id] })
      } else {
        toast.error('Erro ao salvar. Tente novamente.')
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
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text)' }}>GYM</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
            >
              {workoutDay.split}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{workoutDay.muscles}</p>
        </div>
        <div className="flex items-center gap-1">
          {/* Refresh other user */}
          <button
            onClick={handleRefreshOther}
            disabled={otherFetching}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={`Atualizar dados de ${otherName}`}
          >
            <RefreshCw size={16} className={otherFetching ? 'animate-spin' : ''} />
          </button>
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

      <div
        className="px-4 py-4 space-y-4"
        style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)' }}
      >
        {/* Day header */}
        <div className="pt-1 pb-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{workoutDay.label}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {workoutDay.split} · {workoutDay.muscles}
          </p>
        </div>

        {/* Frase do dia */}
        <div
          className="rounded-xl px-4 py-3 text-sm italic"
          style={{ background: 'var(--card-alt)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          &ldquo;{getDailyPhrase()}&rdquo;
        </div>

        {/* Completion banner */}
        {completedToday && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-medium"
            style={{ background: '#f0fdf4', color: 'var(--success)', border: '1px solid #bbf7d0' }}
          >
            Treino completo! 💪 Boa, {session.name}!
          </div>
        )}

        {/* Exercise cards */}
        {workoutDay.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.key}
            exercise={exercise}
            myLastLog={(myLastLogs as Record<string, WorkoutLog>)[getEffectiveKey(exercise.key)] ?? null}
            otherLastLog={(otherLastLogs as Record<string, WorkoutLog>)[getEffectiveKey(exercise.key)] ?? null}
            myName={session.name}
            otherName={otherName}
            values={values[exercise.key]}
            onChange={handleChange}
          />
        ))}

        {/* Footer versão */}
        <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
          GYM Tracker v{VERSION} · {VERSION_DATE}
        </p>
      </div>

      {/* Save FAB — bottom left */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-4 h-12 rounded-full font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
        style={{
          position: 'fixed',
          left: 18,
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 14px)',
          zIndex: 90,
          background: 'var(--text)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <Save size={16} className={isPending ? 'animate-pulse' : ''} />
        {isPending ? 'Salvando…' : 'Salvar'}
      </button>

      <RestTimer />
    </>
  )
}
