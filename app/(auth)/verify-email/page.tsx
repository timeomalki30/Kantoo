'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resent, setResent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleResend() {
    if (!email) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resend({
      type:  'signup',
      email,
    })
    setLoading(false)
    if (err) {
      setError("Impossible de renvoyer l'email. Réessayez dans quelques instants.")
    } else {
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Logo size="lg" variant="full" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-card text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
          <Mail className="h-10 w-10 text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold text-kantoo-text">
          Vérifie ta boîte mail&nbsp;!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          On a envoyé un lien de confirmation à{' '}
          {email ? (
            <span className="font-semibold text-kantoo-text break-all">{email}</span>
          ) : (
            'ton adresse email'
          )}
          . Clique dessus pour activer ton compte.
        </p>

        <p className="mt-2 text-xs text-gray-400">
          Vérifie aussi tes spams si tu ne le vois pas.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Resent confirmation */}
        {resent && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Email renvoyé avec succès !
          </div>
        )}

        {/* Resend button */}
        <div className="mt-6">
          <Button
            variant="secondary"
            size="lg"
            icon={<RotateCcw className="h-4 w-4" />}
            loading={loading}
            onClick={handleResend}
            disabled={!email || resent}
            className="w-full"
          >
            {resent ? 'Email envoyé !' : "Renvoyer l'email"}
          </Button>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 flex justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
