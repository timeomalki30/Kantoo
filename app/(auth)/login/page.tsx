import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Connexion — Kantoo' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size="lg" variant="full" />
        <p className="text-sm text-gray-500">Gérez vos devis et clients en toute simplicité</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-card">
        <h1 className="mb-6 text-xl font-bold text-kantoo-text">Connexion</h1>
        <LoginForm />
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-orange-500 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
