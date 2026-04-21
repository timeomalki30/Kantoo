'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, FileText, FileCheck, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

import { Logo }           from '@/components/ui/Logo'
import { DevisDocument }  from './DevisDocument'
import { SignatureModal } from './SignatureModal'
import { RefusalModal }   from './RefusalModal'
import { calculerTotaux } from '@/lib/devis'
import type { Prestation } from '@/types/devis'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DevisData {
  id: string
  numero: string | null
  titre: string | null
  statut: string | null
  date_emission: string | null
  date_validite: string | null
  message_client: string | null
  total_ht: number | null
  total_tva: number | null
  total_ttc: number | null
  prestations: Prestation[]
  signe_le: string | null
  signature_image: string | null
}

interface ArtisanData {
  prenom: string | null
  nom: string | null
  nom_entreprise: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
  siret: string | null
}

interface ClientData {
  prenom: string | null
  nom: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
  nom_entreprise: string | null
}

interface Props {
  token: string
  devis: DevisData
  artisan: ArtisanData | null
  client: ClientData | null
}

type Status = 'viewing' | 'signed' | 'refused' | 'already_signed'

// ─── Confirmation screens ─────────────────────────────────────────────────────

function SignedConfirmation({
  signatureUrl,
  clientEmail,
  devisId,
}: {
  signatureUrl: string
  clientEmail: string | null
  devisId: string
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Devis signé ✓</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        Votre accord a bien été enregistré. L&apos;artisan sera notifié et vous recontactera
        pour planifier le démarrage des travaux.
      </p>

      <div className="mt-8 w-full max-w-[320px] rounded-2xl border border-gray-200 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Votre signature
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureUrl}
          alt="Votre signature"
          className="mx-auto max-h-24 w-auto"
        />
        <p className="mt-3 text-xs text-gray-400">
          {new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }).format(new Date())}
        </p>
      </div>

      {clientEmail && (
        <div className="mt-6 rounded-xl bg-green-50 px-5 py-4">
          <p className="text-sm text-green-800">
            Un email de confirmation a été envoyé à{' '}
            <strong>{clientEmail}</strong>
          </p>
        </div>
      )}

      <div className="mt-6 w-full max-w-[320px]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Étape suivante
        </p>
        <Link
          href={`/factures/nouvelle?from=${devisId}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-orange-200 bg-orange-50 px-6 py-3.5 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-100 active:scale-[0.98]"
        >
          <FileCheck className="h-5 w-5" />
          Convertir en facture
        </Link>
        <p className="mt-2 text-center text-xs text-gray-400">
          Génère la facture correspondante en un clic
        </p>
      </div>
    </div>
  )
}

function RefusedConfirmation({ reason }: { reason: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Devis refusé</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        Votre refus a été transmis à l&apos;artisan. Merci pour votre retour.
      </p>
      {reason && (
        <div className="mt-6 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Motif indiqué</p>
          <p className="mt-1.5 text-sm text-gray-700">{reason}</p>
        </div>
      )}
      <div className="mt-6 rounded-xl bg-gray-50 px-5 py-4">
        <p className="text-sm text-gray-600">
          Besoin d&apos;un ajustement ?{' '}
          <span className="font-semibold text-orange-500">Contactez l&apos;artisan</span> directement.
        </p>
      </div>
    </div>
  )
}

function AlreadySigned({ signedAt }: { signedAt: string | null }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Devis déjà signé</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        Ce devis a déjà été accepté et signé
        {signedAt ? ` le ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(signedAt))}` : ''}.
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DevisPublicClient({ token, devis, artisan, client }: Props) {
  const [status, setStatus]         = useState<Status>(
    devis.statut === 'accepte' ? 'already_signed' : 'viewing'
  )
  const [showSign, setShowSign]     = useState(false)
  const [showRefuse, setShowRefuse] = useState(false)
  const [signatureUrl, setSignUrl]  = useState(devis.signature_image ?? '')
  const [refuseReason, setRefuseR]  = useState('')
  const [signing, setSigning]       = useState(false)
  const [signError, setSignError]   = useState('')

  // Confetti on sign
  useEffect(() => {
    if (status !== 'signed') return
    const burst = (origin: confetti.Options['origin']) =>
      confetti({ particleCount: 80, spread: 70, origin, colors: ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#EC4899'], scalar: 1.1 })
    const t1 = setTimeout(() => burst({ x: 0.25, y: 0.55 }), 0)
    const t2 = setTimeout(() => burst({ x: 0.75, y: 0.55 }), 150)
    const t3 = setTimeout(() => burst({ x: 0.5,  y: 0.4  }), 300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [status])

  async function handleSigned(dataUrl: string) {
    setSigning(true)
    setSignError('')
    try {
      const res = await fetch('/api/devis/sign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, signatureImage: dataUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        setSignError(err.error ?? 'Erreur lors de la signature.')
        setSigning(false)
        return
      }
      setSignUrl(dataUrl)
      setShowSign(false)
      setStatus('signed')
    } catch {
      setSignError('Erreur réseau. Réessayez.')
    } finally {
      setSigning(false)
    }
  }

  function handleRefused(reason: string) {
    setRefuseR(reason)
    setShowRefuse(false)
    setStatus('refused')
  }

  // ── Build props for DevisDocument ─────────────────────────────────────────

  const artisanInfo = {
    name:    [artisan?.prenom, artisan?.nom].filter(Boolean).join(' ') || artisan?.nom_entreprise || 'Artisan',
    email:   artisan?.email   ?? '',
    phone:   artisan?.telephone ?? '',
    address: artisan?.adresse  ?? '',
    siret:   artisan?.siret    ?? '',
  }

  const clientName = [client?.prenom, client?.nom].filter(Boolean).join(' ')
    || client?.nom_entreprise
    || 'Client'

  const devisForm = {
    numero:        devis.numero ?? '',
    titre:         devis.titre  ?? '',
    date:          devis.date_emission ?? '',
    validiteJours: devis.date_validite
      ? Math.max(0, Math.round((new Date(devis.date_validite).getTime() - new Date(devis.date_emission ?? Date.now()).getTime()) / 86_400_000))
      : 30,
    messageClient: devis.message_client ?? '',
    client: {
      nom:       clientName,
      telephone: client?.telephone ?? '',
      email:     client?.email     ?? '',
      adresse:   client?.adresse   ?? '',
    },
    prestations: devis.prestations,
  }

  const totaux = calculerTotaux(devis.prestations)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-kantoo-bg">

        {/* Top bar */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-4 sm:flex-row sm:justify-between">
            <Logo size="sm" />
            {status === 'viewing' && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 sm:mt-0">
                <FileText className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-600">{devis.numero}</span>
                <span>·</span>
                <span>Devis en attente de signature</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

          {status === 'signed'        && <SignedConfirmation signatureUrl={signatureUrl} clientEmail={client?.email ?? null} devisId={devis.id} />}
          {status === 'refused'       && <RefusedConfirmation reason={refuseReason} />}
          {status === 'already_signed' && <AlreadySigned signedAt={devis.signe_le} />}

          {status === 'viewing' && (
            <>
              {signError && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {signError}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100">
                <DevisDocument form={devisForm} totaux={totaux} artisan={artisanInfo} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={signing}
                  onClick={() => setShowSign(true)}
                  className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-green-500 text-base font-bold text-white shadow-md shadow-green-200 transition-all hover:bg-green-600 active:scale-[0.98] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Accepter et signer
                </button>
                <button
                  type="button"
                  onClick={() => setShowRefuse(true)}
                  className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl border-2 border-red-200 bg-white text-base font-bold text-red-500 transition-all hover:border-red-300 hover:bg-red-50 active:scale-[0.98]"
                >
                  <XCircle className="h-5 w-5" />
                  Refuser
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                En acceptant, vous signez électroniquement ce devis et acceptez les conditions générales de vente.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 py-6 text-center">
          <p className="text-xs text-gray-400">
            Propulsé par{' '}
            <span className="font-semibold text-orange-500">Kantoo</span>
            {' '}· La plateforme des artisans
          </p>
        </div>
      </div>

      {showSign   && <SignatureModal onClose={() => setShowSign(false)}   onValidate={handleSigned} />}
      {showRefuse && <RefusalModal  onClose={() => setShowRefuse(false)}  onConfirm={handleRefused} />}
    </>
  )
}
