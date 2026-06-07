'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Layers, TrendingUp } from 'lucide-react'

const TABS = [
  { href: '/treino/terca', label: 'Terça', icon: Dumbbell, short: 'TER' },
  { href: '/treino/quarta', label: 'Quarta', icon: Layers, short: 'QUA' },
  { href: '/treino/quinta', label: 'Quinta', icon: Dumbbell, short: 'QUI' },
  { href: '/treino/progresso', label: 'Progresso', icon: TrendingUp, short: 'PRG' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    /* Filho direto do body via treino/layout — segue Melhores Práticas v3 */
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="bg-[var(--card)] border-t border-[var(--border)]"
    >
      <div className="flex items-center justify-around max-w-[430px] mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-2.5 flex-1 transition-colors"
              style={{ color: active ? 'var(--accent-pv)' : 'var(--text-muted)' }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
