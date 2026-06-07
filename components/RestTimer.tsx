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

  const progress = timeLeft !== null ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0
  const isDone = timeLeft === 0
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all active:scale-95"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 14px)',
          zIndex: 90,
          background: running ? 'var(--text)' : 'var(--card)',
          border: '1px solid var(--border)',
          color: running ? '#ffffff' : 'var(--text-muted)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {running && timeLeft !== null ? (
          <span className="text-xs font-bold">{formatTime(timeLeft)}</span>
        ) : (
          <Timer size={20} />
        )}
      </button>

      {/* Timer panel */}
      {open && (
        <div
          className="rounded-2xl p-5 shadow-lg"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 'calc(72px + env(safe-area-inset-bottom) + 78px)',
            zIndex: 89,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            width: 210,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Rest Timer
            </span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => startTimer(d)}
                className="flex-1 h-9 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: selectedDuration === d && timeLeft !== null ? 'var(--text)' : 'var(--card-alt)',
                  color: selectedDuration === d && timeLeft !== null ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {d}s
              </button>
            ))}
          </div>

          {timeLeft !== null && (
            <div className="text-center">
              <div
                className="h-1 rounded-full mb-3"
                style={{ background: 'var(--card-alt)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: isDone ? 'var(--success)' : 'var(--text)',
                  }}
                />
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: isDone ? 'var(--success)' : 'var(--text)' }}
              >
                {isDone ? '✅ Go!' : formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--card-alt)', color: 'var(--text)' }}
                >
                  {running ? <Pause size={12} /> : <Play size={12} />}
                  {running ? 'Pause' : 'Resume'}
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
