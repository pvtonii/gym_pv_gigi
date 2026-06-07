'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { loginAction } from '@/lib/actions/login-action'
import { MOTIVATIONAL_PHRASES } from '@/lib/workout-data'
import type { UserId } from '@/types'

const USERS = [
  { id: 'pv' as UserId, name: 'PV', color: '#2563eb', emoji: '⚡' },
  { id: 'gi' as UserId, name: 'GI', color: '#e11d48', emoji: '🌸' },
]

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<(typeof USERS)[0] | null>(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const router = useRouter()
  const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]

  function openDialog(user: (typeof USERS)[0]) {
    setSelectedUser(user)
    setPin(['', '', '', ''])
    setError('')
    setTimeout(() => inputRefs[0].current?.focus(), 100)
  }

  function handlePinChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    if (value && index < 3) inputRefs[index + 1].current?.focus()
    if (newPin.every((d) => d !== '')) handleSubmit(newPin.join(''))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  async function handleSubmit(pinString?: string) {
    if (!selectedUser) return
    const finalPin = pinString ?? pin.join('')
    if (finalPin.length !== 4) return

    setLoading(true)
    setError('')
    const result = await loginAction(selectedUser.id, finalPin)

    if (result.success) {
      router.push('/treino/terca')
    } else {
      setError(result.error ?? 'Login failed.')
      setPin(['', '', '', ''])
      setLoading(false)
      setTimeout(() => inputRefs[0].current?.focus(), 50)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-5xl font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>
          GYM
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Tracker
        </div>
      </div>

      {/* User cards */}
      <div className="flex gap-4 w-full max-w-xs">
        {USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => openDialog(user)}
            className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all active:scale-95"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div
              className="text-3xl w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: `${user.color}14` }}
            >
              {user.emoji}
            </div>
            <span className="text-xl font-bold" style={{ color: user.color }}>
              {user.name}
            </span>
          </button>
        ))}
      </div>

      {/* Phrase */}
      <p className="mt-10 text-center text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
        &ldquo;{phrase}&rdquo;
      </p>

      {/* PIN Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent
          className="max-w-xs rounded-3xl p-8"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-center text-xl font-bold"
              style={{ color: selectedUser?.color }}
            >
              {selectedUser?.emoji} {selectedUser?.name}
            </DialogTitle>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Enter your 4-digit PIN
            </p>
          </DialogHeader>

          <div className="flex justify-center gap-3 mt-4">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl outline-none transition-all"
                style={{
                  background: 'var(--card-alt)',
                  border: `2px solid ${digit ? (selectedUser?.color ?? 'var(--border)') : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm mt-2" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={loading || pin.some((d) => !d)}
            className="w-full mt-5 h-12 rounded-xl font-semibold text-sm transition-all active:scale-98 disabled:opacity-40"
            style={{ background: selectedUser?.color ?? 'var(--text)', color: '#ffffff' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
