'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer, X, Play, Pause } from 'lucide-react'

const DURATIONS = [60, 90, 120]

export function RestTimer() {
  const [open, setOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(90)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t === null || t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            // Vibrar ao terminar
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current!)
  }, [running])

  function startTimer(duration: number) {
    clearInterval(intervalRef.current!)
    setSelectedDuration(duration)
    setTimeLeft(duration)
    setRunning(true)
  }

  function togglePause() {
    if (running) {
      clearInterval(intervalRef.current!)
      setRunning(false)
    } else if (timeLeft !== null && timeLeft > 0) {
      setRunning(true)
    }
  }

  function reset() {
    clearInterval(intervalRef.current!)
    setRunning(false)
    setTimeLeft(null)
  }

  const progress =
    timeLeft !== null ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0

  const isDone = timeLeft === 0

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all active:scale-95"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 14px)',
          zIndex: 90,
          background: running ? 'var(--accent)' : 'var(--card)',
          border: `2px solid ${running ? 'var(--accent)' : 'var(--border)'}`,
          color: running ? '#0d0f14' : 'var(--text-muted)',
        }}
      >
        {running && timeLeft !== null ? (
          <span className="text-xs font-bold">{formatTime(timeLeft)}</span>
        ) : (
          <Timer size={22} />
        )}
      </button>

      {/* Painel do timer */}
      {open && (
        <div
          className="rounded-2xl p-5 shadow-xl"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 'calc(72px + env(safe-area-inset-bottom) + 86px)',
            zIndex: 89,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            width: 220,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
              ⏱ Descanso
            </span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Seleção de duração */}
          <div className="flex gap-2 mb-4">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => startTimer(d)}
                className="flex-1 h-9 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background:
                    selectedDuration === d && timeLeft !== null
                      ? 'var(--accent)'
                      : 'var(--card-alt)',
                  color:
                    selectedDuration === d && timeLeft !== null
                      ? '#0d0f14'
                      : 'var(--text-muted)',
                }}
              >
                {d}s
              </button>
            ))}
          </div>

          {/* Display */}
          {timeLeft !== null && (
            <div className="text-center mb-4">
              {/* Barra de progresso */}
              <div
                className="h-1.5 rounded-full mb-3"
                style={{ background: 'var(--card-alt)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: isDone ? 'var(--success)' : 'var(--accent)',
                  }}
                />
              </div>
              <div
                className="text-3xl font-black"
                style={{ color: isDone ? 'var(--success)' : 'var(--text)' }}
              >
                {isDone ? '✅ Vai!' : formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'var(--card-alt)',
                    color: 'var(--text)',
                  }}
                >
                  {running ? <Pause size={13} /> : <Play size={13} />}
                  {running ? 'Pausar' : 'Continuar'}
                </button>
                <button
                  onClick={reset}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--card-alt)', color: 'var(--text-muted)' }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
