import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEV_USER } from '@/lib/supabase/dev-user'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { ToastProvider } from '@/components/ui/Toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  let user = isDevMode ? DEV_USER : null

  if (!isDevMode) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) redirect('/login')
    user = data.user
  }

  // user is guaranteed non-null here (either DEV_USER or real user)
  const safeUser = user!

  const name = (safeUser.user_metadata?.full_name as string | undefined)
    ?? safeUser.email
    ?? 'Artisan'

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden bg-kantoo-bg">

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <Sidebar user={safeUser} className="hidden lg:flex" />

      {/* ── Right column ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top header — hidden on wizard pages */}
        <MobileHeader initials={initials} />

        {/* Scrollable content — pb-16 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>

      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <BottomNav />

    </div>
    </ToastProvider>
  )
}
