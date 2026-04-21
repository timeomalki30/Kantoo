'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, FileText, Users, CreditCard, Settings, LogOut, FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_MAIN = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home      },
  { href: '/devis',     label: 'Devis',           icon: FileText  },
  { href: '/factures',  label: 'Factures',         icon: FileCheck },
  { href: '/clients',   label: 'Clients',          icon: Users     },
  { href: '/paiements', label: 'Paiements',        icon: CreditCard},
]

const NAV_BOTTOM = [
  { href: '/compte', label: 'Mon compte', icon: Settings },
]

interface SidebarProps {
  user: User
  className?: string
}

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      router.push('/')
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name  = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Artisan'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside
      className={cn(
        'flex h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Logo size="sm" />
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {NAV_MAIN.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon
                className={cn('h-5 w-5 shrink-0', active ? 'text-orange-500' : 'text-gray-400')}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 px-3 py-3">
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-orange-500' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}

        {/* User row */}
        <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">{name}</p>
            <p className="truncate text-[11px] text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Déconnexion"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
