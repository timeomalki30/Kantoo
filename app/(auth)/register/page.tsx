import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: "Créer un compte — Kantoo" }

export default function RegisterPage() {
  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size="lg" variant="full" />
        <p className="text-sm text-gray-500">Créez votre espace artisan en moins de 2 minutes</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-card">
        <h1 className="mb-6 text-xl font-bold text-kantoo-text">Créer mon compte</h1>
        <RegisterForm />
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà inscrit ?{' '}
        <Link href="/login" className="font-semibold text-orange-500 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
