'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Exercise, WorkoutLog } from '@/types'

export interface ExerciseValues {
  weight: string
}

interface ExerciseCardProps {
  exercise: Exercise
  myLastLog: WorkoutLog | null
  otherLastLog: WorkoutLog | null
  myName: string
  otherName: string
  values: ExerciseValues
  onChange: (key: string, values: ExerciseValues) => void
}

export function ExerciseCard({
  exercise,
  myLastLog,
  otherLastLog,
  myName,
  otherName,
  values,
  onChange,
}: ExerciseCardProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(exercise.name).then(() => {
      setCopied(true)
      toast.success('Copied!', { duration: 1500 })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const prevWeight = myLastLog?.weight ?? null
  const otherWeight = otherLastLog?.weight ?? null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Image */}
      {exercise.imageUrl && !imgError && (
        <div
          className="relative w-full h-32"
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

      <div className="p-4 space-y-3">
        {/* Name + copy */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text)' }}>
              {exercise.name}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{exercise.muscle}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all active:scale-95"
            style={{
              background: copied ? '#f0fdf4' : 'var(--card-alt)',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${copied ? '#bbf7d0' : 'var(--border)'}`,
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            Copy
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* MY weight: previous + current */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-pv)' }}>
            {myName}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Previous */}
            <div>
              <label className="text-[10px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                Previous
              </label>
              <div
                className="h-11 rounded-xl px-3 flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--card-alt)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}
              >
                {prevWeight !== null ? `${prevWeight} lbs` : '—'}
              </div>
            </div>

            {/* Current (editable) */}
            <div>
              <label className="text-[10px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                Current (lbs)
              </label>
              <input
                type="number"
                inputMode="decimal"
                placeholder={prevWeight?.toString() ?? '0'}
                value={values.weight}
                onChange={(e) => onChange(exercise.key, { weight: e.target.value })}
                className="w-full h-11 rounded-xl px-3 text-center text-sm font-semibold outline-none transition-all"
                style={{
                  background: 'var(--card-alt)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* OTHER user — fixed history */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-gi)' }}>
            {otherName}
          </span>
          <span className="text-sm font-semibold" style={{ color: otherWeight !== null ? 'var(--text)' : 'var(--text-muted)' }}>
            {otherWeight !== null ? `${otherWeight} lbs` : 'No record'}
          </span>
        </div>
      </div>
    </div>
  )
}
