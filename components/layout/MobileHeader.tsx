'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'

const WIZARD_PATHS = ['/devis/nouveau', '/factures/nouvelle']

export function MobileHeader({ initials }: { initials: string }) {
  const pathname = usePathname()

  const isWizard =
    WIZARD_PATHS.includes(pathname) ||
    (/^\/factures\/[^/]+$/.test(pathname) && pathname !== '/factures')

  if (isWizard) return null

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
      <Logo size="sm" variant="full" />
      <Link
        href="/compte"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600"
      >
        {initials}
      </Link>
    </header>
  )
}
