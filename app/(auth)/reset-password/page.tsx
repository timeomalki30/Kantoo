import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = { title: 'Mot de passe oublié — Kantoo' }

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size="lg" variant="full" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-card">
        <h1 className="mb-2 text-xl font-bold text-kantoo-text">Mot de passe oublié</h1>
        <p className="mb-6 text-sm text-gray-500">
          Entrez votre email, nous vous enverrons un lien de réinitialisation.
        </p>
        <ResetPasswordForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-semibold text-orange-500 hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
