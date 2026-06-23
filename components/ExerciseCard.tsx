'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Copy, Check, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Exercise, WorkoutLog } from '@/types'

export interface ExerciseValues {
  weight: string
  customName?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  myCurrentLog: WorkoutLog | null
  myPreviousLog: WorkoutLog | null
  otherLastLog: WorkoutLog | null
  myName: string
  otherName: string
  values: ExerciseValues
  onChange: (key: string, values: ExerciseValues) => void
}

export function ExerciseCard({
  exercise,
  myCurrentLog,
  myPreviousLog,
  otherLastLog,
  myName,
  otherName,
  values,
  onChange,
}: ExerciseCardProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const displayName = values.customName?.trim() || exercise.name

  function handleCopy() {
    navigator.clipboard.writeText(displayName).then(() => {
      setCopied(true)
      toast.success('Copied!', { duration: 1500 })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function startEditing() {
    setNameInput(displayName)
    setEditingName(true)
    setTimeout(() => nameRef.current?.select(), 50)
  }

  function commitName() {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== exercise.name) {
      onChange(exercise.key, { ...values, customName: trimmed })
    } else if (!trimmed || trimmed === exercise.name) {
      onChange(exercise.key, { ...values, customName: '' })
    }
    setEditingName(false)
  }

  function cancelName() {
    setEditingName(false)
  }

  const prevWeight = myPreviousLog?.weight ?? null
  const curWeight = myCurrentLog?.weight ?? null
  const otherWeight = otherLastLog?.weight ?? null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      {/* Image */}
      {exercise.imageUrl && !imgError && (
        <div
          className="relative w-full h-32"
          style={{ background: 'var(--card-alt)', borderBottom: '1px solid var(--border)' }}
        >
          <Image
            src={exercise.imageUrl}
            alt={displayName}
            fill
            className="object-contain p-3"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={nameRef}
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitName()
                    if (e.key === 'Escape') cancelName()
                  }}
                  className="flex-1 text-[15px] font-semibold rounded-lg px-2 py-1 outline-none"
                  style={{
                    background: 'var(--card-alt)',
                    border: '1.5px solid var(--accent-pv)',
                    color: 'var(--text)',
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={commitName}
                  className="flex-shrink-0 p-1 rounded-lg"
                  style={{ background: 'var(--accent-pv)', color: '#fff' }}
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={cancelName}
                  className="flex-shrink-0 p-1 rounded-lg"
                  style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <h3 className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text)' }}>
                  {displayName}
                </h3>
                {values.customName && values.customName !== exercise.name && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}>
                    custom
                  </span>
                )}
                <button
                  onClick={startEditing}
                  className="p-0.5 rounded opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
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

        {/* MY weight */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-pv)' }}>
            {myName}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                Previous
              </label>
              <div
                className="h-11 rounded-xl px-2 flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--card-alt)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}
              >
                {prevWeight !== null ? `${prevWeight}` : '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                Current
              </label>
              <div
                className="h-11 rounded-xl px-2 flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--card-alt)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
              >
                {curWeight !== null ? `${curWeight}` : '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                New (lbs)
              </label>
              <input
                type="number"
                inputMode="decimal"
                placeholder={curWeight?.toString() ?? '0'}
                value={values.weight}
                onChange={(e) => onChange(exercise.key, { ...values, weight: e.target.value })}
                className="w-full h-11 rounded-xl px-2 text-center text-sm font-semibold outline-none transition-all"
                style={{ background: 'var(--card-alt)', border: '1.5px solid var(--accent-pv)', color: 'var(--text)' }}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* OTHER user */}
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
