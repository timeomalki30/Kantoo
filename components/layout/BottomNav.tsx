'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, FileCheck, Users, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/dashboard', label: 'Accueil',   icon: Home       },
  { href: '/devis',     label: 'Devis',     icon: FileText   },
  { href: '/factures',  label: 'Factures',  icon: FileCheck  },
  { href: '/clients',   label: 'Clients',   icon: Users      },
  { href: '/paiements', label: 'Paiements', icon: CreditCard },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex h-16 items-stretch">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-orange-500' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  active ? 'text-orange-500' : 'text-gray-400'
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-orange-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
