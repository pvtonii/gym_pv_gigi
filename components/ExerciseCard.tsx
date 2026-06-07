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
  lastLog: WorkoutLog | null
  pr: number | null
  readonly?: boolean
  ownerName?: string
  values?: ExerciseValues
  onChange?: (key: string, values: ExerciseValues) => void
}

export function ExerciseCard({
  exercise,
  lastLog,
  pr,
  readonly = false,
  ownerName,
  values = { weight: '', sets: '', reps: '' },
  onChange,
}: ExerciseCardProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isNewPR =
    values.weight && pr !== null && parseFloat(values.weight) > pr

  function handleCopy() {
    navigator.clipboard.writeText(exercise.name).then(() => {
      setCopied(true)
      toast.success(`"${exercise.name}" copiado!`, { duration: 2000 })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleChange(field: keyof ExerciseValues, value: string) {
    onChange?.(exercise.key, { ...values, [field]: value })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Imagem */}
      <div
        className="relative w-full h-40 flex items-center justify-center"
        style={{ background: 'var(--card-alt)' }}
      >
        {!imgError ? (
          <Image
            src={exercise.imageUrl}
            alt={exercise.name}
            fill
            className="object-contain p-2"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-30">
            <span className="text-4xl">💪</span>
          </div>
        )}
        <div
          className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: 'rgba(0,229,255,0.12)',
            color: 'var(--accent)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {exercise.muscle}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Nome + Copiar */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-bold text-base leading-tight flex-1"
            style={{ color: 'var(--text)' }}
          >
            {exercise.name}
          </h3>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all active:scale-95"
            style={{
              background: copied ? 'rgba(0,230,118,0.12)' : 'var(--card-alt)',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${copied ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            Copiar
          </button>
        </div>

        {/* Dica */}
        {exercise.tips && (
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            {exercise.tips}
          </p>
        )}

        {/* Readonly */}
        {readonly ? (
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
          >
            {lastLog ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ color: 'var(--text)' }}>
                  <strong>{lastLog.weight ?? '—'}kg</strong>
                </span>
                <span>
                  {lastLog.sets ?? '—'}×{lastLog.reps ?? '—'} reps
                </span>
                {pr !== null && (
                  <span
                    className="flex items-center gap-1 text-xs ml-auto"
                    style={{ color: 'var(--warning)' }}
                  >
                    <Trophy size={11} /> PR: {pr}kg
                  </span>
                )}
              </div>
            ) : (
              <span>Sem registros ainda</span>
            )}
            <p className="text-xs mt-1 opacity-50">
              Treino de {ownerName} — somente leitura
            </p>
          </div>
        ) : (
          /* Inputs editáveis */
          <div className="space-y-3">
            {lastLog && (
              <div
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
              >
                <span>Última sessão:</span>
                <span style={{ color: 'var(--text)' }}>
                  {lastLog.weight ?? '—'}kg · {lastLog.sets ?? '—'}×{lastLog.reps ?? '—'}
                </span>
                {pr !== null && (
                  <span
                    className="ml-auto flex items-center gap-1"
                    style={{ color: 'var(--warning)' }}
                  >
                    <Trophy size={11} /> PR: {pr}kg
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                { field: 'weight' as const, label: 'Peso (kg)', placeholder: lastLog?.weight?.toString() ?? '0' },
                { field: 'sets' as const, label: 'Séries', placeholder: lastLog?.sets?.toString() ?? '4' },
                { field: 'reps' as const, label: 'Reps', placeholder: lastLog?.reps?.toString() ?? '10' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    inputMode={field === 'weight' ? 'decimal' : 'numeric'}
                    placeholder={placeholder}
                    value={values[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full h-10 rounded-lg px-2 text-center text-sm font-bold outline-none transition-all"
                    style={{
                      background: 'var(--card-alt)',
                      border: `1.5px solid ${
                        field === 'weight' && isNewPR
                          ? 'var(--success)'
                          : 'var(--border)'
                      }`,
                      color: 'var(--text)',
                    }}
                  />
                </div>
              ))}
            </div>

            {isNewPR && (
              <div
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium"
                style={{
                  background: 'rgba(0,230,118,0.1)',
                  color: 'var(--success)',
                }}
              >
                <Trophy size={13} />
                Novo Personal Record! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
