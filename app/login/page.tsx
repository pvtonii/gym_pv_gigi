'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/lib/actions/login-action'
import { MOTIVATIONAL_PHRASES } from '@/lib/workout-data'
import type { UserId } from '@/types'

const USERS = [
  { id: 'pv' as UserId, name: 'PV', color: '#00e5ff', emoji: '⚡' },
  { id: 'gi' as UserId, name: 'GI', color: '#ff4081', emoji: '🌸' },
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
    if (newPin.every((d) => d !== '')) {
      handleSubmit(newPin.join(''))
    }
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
      setError(result.error ?? 'Erro ao fazer login.')
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
        <div
          className="text-5xl font-black tracking-tight mb-1"
          style={{ color: 'var(--accent)' }}
        >
          GYM
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Tracker
        </div>
      </div>

      {/* User cards */}
      <div className="flex gap-5 w-full max-w-xs">
        {USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => openDialog(user)}
            className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all active:scale-95"
            style={{
              background: 'var(--card)',
              border: `2px solid var(--border)`,
            }}
          >
            <div
              className="text-4xl w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl"
              style={{ background: `${user.color}22`, color: user.color }}
            >
              {user.emoji}
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: user.color }}
            >
              {user.name}
            </span>
          </button>
        ))}
      </div>

      {/* Motivational phrase */}
      <p
        className="mt-10 text-center text-sm max-w-xs"
        style={{ color: 'var(--text-muted)' }}
      >
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
              className="text-center text-2xl font-bold"
              style={{ color: selectedUser?.color }}
            >
              {selectedUser?.emoji} {selectedUser?.name}
            </DialogTitle>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Digite seu PIN de 4 dígitos
            </p>
          </DialogHeader>

          <div className="flex justify-center gap-3 mt-6">
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
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all"
                style={{
                  background: 'var(--card-alt)',
                  border: `2px solid ${digit ? (selectedUser?.color ?? 'var(--accent)') : 'var(--border)'}`,
                  color: 'var(--text)',
                  caretColor: selectedUser?.color,
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm mt-3" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <Button
            onClick={() => handleSubmit()}
            disabled={loading || pin.some((d) => !d)}
            className="w-full mt-6 h-12 rounded-xl font-bold text-base"
            style={{
              background: selectedUser?.color,
              color: '#0d0f14',
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
