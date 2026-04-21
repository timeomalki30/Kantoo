'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function Navbar({ user }: { user: User }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-primary-600">
            Artisants
          </Link>
          <div className="hidden gap-4 sm:flex">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Tableau de bord
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Paramètres
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-500 sm:block">{user.email}</span>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  )
}
