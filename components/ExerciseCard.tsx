'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Copy, Check, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import type { Exercise, WorkoutLog } from '@/types'

export interface ExerciseValues {
  weight: string
  sets: string
  reps: string
}

interface ExerciseCardProps {
  exercise: Exercise
  myLastLog: WorkoutLog | null
  otherLastLog: WorkoutLog | null
  myPr: number | null
  otherPr: number | null
  myName: string
  otherName: string
  values: ExerciseValues
  onChange: (key: string, values: ExerciseValues) => void
}

export function ExerciseCard({
  exercise,
  myLastLog,
  otherLastLog,
  myPr,
  otherPr,
  myName,
  otherName,
  values,
  onChange,
}: ExerciseCardProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  const currentWeight = values.weight ? parseFloat(values.weight) : null
  const isNewPR = currentWeight !== null && myPr !== null && currentWeight > myPr

  function handleCopy() {
    navigator.clipboard.writeText(exercise.name).then(() => {
      setCopied(true)
      toast.success(`Copied!`, { duration: 1500 })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleChange(field: keyof ExerciseValues, value: string) {
    onChange(exercise.key, { ...values, [field]: value })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Imagem — só renderiza se tiver URL */}
      {exercise.imageUrl && !imgError && (
        <div
          className="relative w-full h-36 flex items-center justify-center"
          style={{ background: 'var(--card-alt)', borderBottom: '1px solid var(--border)' }}
        >
          <Image
            src={exercise.imageUrl}
            alt={exercise.name}
            fill
            className="object-contain p-3"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Nome + músculo + copy */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-[15px] leading-snug"
              style={{ color: 'var(--text)' }}
            >
              {exercise.name}
            </h3>
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {exercise.muscle}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95"
            style={{
              background: copied ? '#f0fdf4' : 'var(--card-alt)',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${copied ? '#bbf7d0' : 'var(--border)'}`,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            Copy
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* MY LOG section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--accent-pv)' }}
            >
              {myName}
            </span>
            {myLastLog && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Last:{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {myLastLog.weight ?? '—'}kg
                </strong>
                {' '}· {myLastLog.sets ?? '—'}×{myLastLog.reps ?? '—'}
                {myPr !== null && (
                  <span style={{ color: 'var(--warning)' }} className="ml-2">
                    <Trophy size={10} className="inline mb-0.5" /> PR: {myPr}kg
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { field: 'weight' as const, label: 'Weight (kg)', ph: myLastLog?.weight?.toString() ?? '0' },
              { field: 'sets' as const, label: 'Sets', ph: myLastLog?.sets?.toString() ?? '4' },
              { field: 'reps' as const, label: 'Reps', ph: myLastLog?.reps?.toString() ?? '10' },
            ].map(({ field, label, ph }) => (
              <div key={field}>
                <label
                  className="text-[10px] font-medium block mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </label>
                <input
                  type="number"
                  inputMode={field === 'weight' ? 'decimal' : 'numeric'}
                  placeholder={ph}
                  value={values[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full h-10 rounded-xl px-2 text-center text-sm font-semibold outline-none transition-all"
                  style={{
                    background: 'var(--card-alt)',
                    border: `1.5px solid ${
                      field === 'weight' && isNewPR ? '#86efac' : 'var(--border)'
                    }`,
                    color: 'var(--text)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* PR badge */}
          {isNewPR && (
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium"
              style={{ background: '#f0fdf4', color: 'var(--success)' }}
            >
              <Trophy size={12} />
              New Personal Record! 🎉
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* OTHER USER section */}
        <div className="space-y-1">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--accent-gi)' }}
          >
            {otherName}
          </span>
          {otherLastLog ? (
            <div
              className="flex items-center justify-between text-sm px-3 py-2.5 rounded-xl"
              style={{ background: 'var(--card-alt)' }}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {otherLastLog.weight ?? '—'}kg
                </span>
                <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                  {otherLastLog.sets ?? '—'}×{otherLastLog.reps ?? '—'} reps
                </span>
              </div>
              {otherPr !== null && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--warning)' }}
                >
                  <Trophy size={11} /> PR: {otherPr}kg
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No records yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
