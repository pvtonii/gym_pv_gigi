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

function getLastNLogs(
  logs: WorkoutLog[],
  exerciseKey: string,
  n = 8
): WorkoutLog[] {
  return logs
    .filter((l) => l.exercise_key === exerciseKey && l.weight !== null)
    .slice(-n)
}

function Sparkline({
  pvPoints,
  giPoints,
}: {
  pvPoints: number[]
  giPoints: number[]
}) {
  const all = [...pvPoints, ...giPoints]
  if (all.length === 0) return null

  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1

  const width = 240
  const height = 48
  const pad = 4
  const innerW = width - pad * 2
  const innerH = height - pad * 2

  function toPath(points: number[]): string {
    if (points.length === 0) return ''
    const step = innerW / Math.max(points.length - 1, 1)
    return points
      .map((v, i) => {
        const x = pad + i * step
        const y = pad + innerH - ((v - min) / range) * innerH
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {pvPoints.length > 1 && (
        <path
          d={toPath(pvPoints)}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {giPoints.length > 1 && (
        <path
          d={toPath(giPoints)}
          fill="none"
          stroke="#ff4081"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {pvPoints.map((v, i) => {
        const step = innerW / Math.max(pvPoints.length - 1, 1)
        return (
          <circle
            key={i}
            cx={pad + i * step}
            cy={pad + innerH - ((v - min) / range) * innerH}
            r={3}
            fill="#00e5ff"
          />
        )
      })}
      {giPoints.map((v, i) => {
        const step = innerW / Math.max(giPoints.length - 1, 1)
        return (
          <circle
            key={i}
            cx={pad + i * step}
            cy={pad + innerH - ((v - min) / range) * innerH}
            r={3}
            fill="#ff4081"
          />
        )
      })}
    </svg>
  )
}

export function ProgressClient({
  workoutDays,
  pvLogs,
  giLogs,
}: ProgressClientProps) {
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
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  )

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  return (
    <div
      className="px-4 py-4 space-y-5"
      style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)' }}
    >
      {/* Filtro por dia */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'all', label: 'Todos' },
          ...workoutDays.map((d) => ({ key: d.day, label: d.label })),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setSelectedDay(key)
              const firstEx =
                key === 'all'
                  ? allExercises[0]
                  : workoutDays.find((d) => d.day === key)?.exercises[0]
              if (firstEx) setSelectedKey(firstEx.key)
            }}
            className="flex-shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: selectedDay === key ? 'var(--accent)' : 'var(--card)',
              color: selectedDay === key ? '#0d0f14' : 'var(--text-muted)',
              border: `1px solid ${selectedDay === key ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Seletor de exercício */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Exercício
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {filteredExercises.map((e) => (
            <button
              key={e.key}
              onClick={() => setSelectedKey(e.key)}
              className="text-left text-sm px-4 py-2.5 rounded-xl font-medium transition-all"
              style={{
                background: selectedKey === e.key ? 'rgba(0,229,255,0.12)' : 'var(--card)',
                color: selectedKey === e.key ? 'var(--accent)' : 'var(--text)',
                border: `1px solid ${selectedKey === e.key ? 'rgba(0,229,255,0.3)' : 'var(--border)'}`,
              }}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Painel do exercício selecionado */}
      {selectedExercise && (
        <div
          className="rounded-2xl p-4 space-y-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--text)' }}>
            {selectedExercise.name}
          </h2>

          {/* PRs */}
          <div className="grid grid-cols-2 gap-3">
            {(['pv', 'gi'] as UserId[]).map((uid) => {
              const pr = uid === 'pv' ? pvPR : giPR
              return (
                <div
                  key={uid}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--card-alt)' }}
                >
                  <div
                    className="flex items-center justify-center gap-1 text-xs font-bold mb-1"
                    style={{ color: USER_COLORS[uid] }}
                  >
                    <Trophy size={12} />
                    {uid.toUpperCase()} PR
                  </div>
                  <div
                    className="text-2xl font-black"
                    style={{ color: pr ? USER_COLORS[uid] : 'var(--text-muted)' }}
                  >
                    {pr ? `${pr}kg` : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gráfico */}
          {(pvWeights.length > 0 || giWeights.length > 0) ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Evolução (últimas 8 sessões)
                </span>
                <div className="flex items-center gap-3 ml-auto">
                  {pvWeights.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>PV</span>
                    </div>
                  )}
                  {giWeights.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4081]" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>GI</span>
                    </div>
                  )}
                </div>
              </div>
              <Sparkline pvPoints={pvWeights} giPoints={giWeights} />
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Nenhum registro ainda
            </p>
          )}

          {/* Tabela de histórico */}
          {allExLogs.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Histórico
              </p>
              <div className="space-y-1.5">
                {[...allExLogs].reverse().slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-sm px-3 py-2 rounded-xl"
                    style={{ background: 'var(--card-alt)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: USER_COLORS[log.user_id] }}
                      />
                      <span style={{ color: USER_COLORS[log.user_id] }} className="font-bold text-xs">
                        {log.user_id.toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                        {formatDate(log.logged_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <span className="font-bold">{log.weight ?? '—'}kg</span>
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                        {log.sets ?? '—'}×{log.reps ?? '—'}
                      </span>
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
