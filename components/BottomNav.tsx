'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Layers, TrendingUp } from 'lucide-react'

const TABS = [
  { href: '/treino/terca', label: 'Tuesday', icon: Dumbbell },
  { href: '/treino/quarta', label: 'Wednesday', icon: Layers },
  { href: '/treino/quinta', label: 'Thursday', icon: Dumbbell },
  { href: '/treino/progresso', label: 'Progress', icon: TrendingUp },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
      }}
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
