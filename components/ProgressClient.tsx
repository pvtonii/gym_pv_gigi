'use client'

import { useState } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'
import type { WorkoutDay, WorkoutLog, UserId } from '@/types'

interface ProgressClientProps {
  workoutDays: WorkoutDay[]
  pvLogs: WorkoutLog[]
  giLogs: WorkoutLog[]
  currentUserId: UserId
}

const USER_COLORS: Record<string, string> = {
  pv: 'var(--accent-pv)',
  gi: 'var(--accent-gi)',
}

function getMaxWeight(logs: WorkoutLog[], exerciseKey: string): number | null {
  const filtered = logs
    .filter((l) => l.exercise_key === exerciseKey && l.weight !== null)
    .map((l) => l.weight as number)
  return filtered.length > 0 ? Math.max(...filtered) : null
}

function getLastNLogs(logs: WorkoutLog[], exerciseKey: string, n = 8): WorkoutLog[] {
  return logs.filter((l) => l.exercise_key === exerciseKey && l.weight !== null).slice(-n)
}

function Sparkline({ pvPoints, giPoints }: { pvPoints: number[]; giPoints: number[] }) {
  const all = [...pvPoints, ...giPoints]
  if (all.length === 0) return null

  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1
  const W = 240, H = 48, P = 6
  const iW = W - P * 2, iH = H - P * 2

  function toPath(points: number[]): string {
    if (points.length < 2) return ''
    const step = iW / (points.length - 1)
    return points
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${P + i * step},${P + iH - ((v - min) / range) * iH}`)
      .join(' ')
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {pvPoints.length > 1 && (
        <path d={toPath(pvPoints)} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {giPoints.length > 1 && (
        <path d={toPath(giPoints)} fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {pvPoints.map((v, i) => (
        <circle key={`pv-${i}`} cx={P + i * (iW / Math.max(pvPoints.length - 1, 1))} cy={P + iH - ((v - min) / range) * iH} r={3} fill="#2563eb" />
      ))}
      {giPoints.map((v, i) => (
        <circle key={`gi-${i}`} cx={P + i * (iW / Math.max(giPoints.length - 1, 1))} cy={P + iH - ((v - min) / range) * iH} r={3} fill="#e11d48" />
      ))}
    </svg>
  )
}

export function ProgressClient({ workoutDays, pvLogs, giLogs }: ProgressClientProps) {
  const allExercises = workoutDays.flatMap((d) => d.exercises)
  const [selectedKey, setSelectedKey] = useState(allExercises[0]?.key ?? '')
  const [selectedDay, setSelectedDay] = useState<string>('all')

  const filteredExercises =
    selectedDay === 'all'
      ? allExercises
      : workoutDays.find((d) => d.day === selectedDay)?.exercises ?? []

  const selectedExercise = allExercises.find((e) => e.key === selectedKey)
  const pvExLogs = getLastNLogs(pvLogs, selectedKey)
  const giExLogs = getLastNLogs(giLogs, selectedKey)
  const pvWeights = pvExLogs.map((l) => l.weight as number)
  const giWeights = giExLogs.map((l) => l.weight as number)
  const pvPR = getMaxWeight(pvLogs, selectedKey)
  const giPR = getMaxWeight(giLogs, selectedKey)

  const allExLogs = [...pvExLogs, ...giExLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="px-4 py-4 space-y-5" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)' }}>

      {/* Day filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ key: 'all', label: 'All' }, ...workoutDays.map((d) => ({ key: d.day, label: d.label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setSelectedDay(key)
              const first = key === 'all' ? allExercises[0] : workoutDays.find((d) => d.day === key)?.exercises[0]
              if (first) setSelectedKey(first.key)
            }}
            className="flex-shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: selectedDay === key ? 'var(--text)' : 'var(--card)',
              color: selectedDay === key ? '#ffffff' : 'var(--text-muted)',
              border: `1px solid ${selectedDay === key ? 'var(--text)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Exercise selector */}
      <div className="grid grid-cols-1 gap-1.5">
        {filteredExercises.map((e) => (
          <button
            key={e.key}
            onClick={() => setSelectedKey(e.key)}
            className="text-left text-sm px-4 py-2.5 rounded-xl font-medium transition-all"
            style={{
              background: selectedKey === e.key ? 'var(--text)' : 'var(--card)',
              color: selectedKey === e.key ? '#ffffff' : 'var(--text)',
              border: `1px solid ${selectedKey === e.key ? 'var(--text)' : 'var(--border)'}`,
              boxShadow: selectedKey === e.key ? 'none' : 'var(--shadow)',
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Exercise detail */}
      {selectedExercise && (
        <div className="rounded-2xl p-4 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>{selectedExercise.name}</h2>

          {/* PRs */}
          <div className="grid grid-cols-2 gap-3">
            {(['pv', 'gi'] as UserId[]).map((uid) => {
              const pr = uid === 'pv' ? pvPR : giPR
              return (
                <div key={uid} className="rounded-xl p-3 text-center" style={{ background: 'var(--card-alt)' }}>
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold mb-1" style={{ color: USER_COLORS[uid] }}>
                    <Trophy size={11} /> {uid.toUpperCase()} PR
                  </div>
                  <div className="text-2xl font-bold" style={{ color: pr ? USER_COLORS[uid] : 'var(--text-muted)' }}>
                    {pr ? `${pr}lbs` : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chart */}
          {(pvWeights.length > 0 || giWeights.length > 0) ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 8 sessions</span>
                <div className="flex items-center gap-3 ml-auto">
                  {pvWeights.length > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>PV</span></div>}
                  {giWeights.length > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-600" /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>GI</span></div>}
                </div>
              </div>
              <Sparkline pvPoints={pvWeights} giPoints={giWeights} />
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No records yet</p>
          )}

          {/* History table */}
          {allExLogs.length > 0 && (
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>History</p>
              <div className="space-y-1.5">
                {allExLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--card-alt)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: USER_COLORS[log.user_id] }} />
                      <span className="font-semibold text-xs" style={{ color: USER_COLORS[log.user_id] }}>{log.user_id.toUpperCase()}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(log.logged_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{log.weight ?? '—'}lbs</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{log.sets ?? '—'}×{log.reps ?? '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
