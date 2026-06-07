import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { BottomNav } from '@/components/BottomNav'
import { SessionProvider } from '@/components/SessionProvider'

export default async function TreinoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <SessionProvider session={session}>
      {/* #app: topbar + content — SEM overflow:hidden, SEM height fixo */}
      <div id="app" className="max-w-[430px] mx-auto bg-[var(--bg)]">
        {children}
      </div>
      {/* BottomNav: filho direto do body via este layout (fora do #app) */}
      <BottomNav />
    </SessionProvider>
  )
}
