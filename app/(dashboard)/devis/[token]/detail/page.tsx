'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, Check, Mail, FileCheck,
  Clock, User, Calendar, FileText,
} from 'lucide-react'
import { Badge }        from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button }       from '@/components/ui/Button'
import { formatEuros }  from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'
import { useToast }     from '@/components/ui/Toast'
import type { DevisStatus } from '@/components/ui/Badge'
import type { Prestation }  from '@/types/devis'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DevisDetail {
  id: string
  numero: string | null
  titre: string | null
  statut: string | null
  total_ht: number | null
  total_tva: number | null
  total_ttc: number | null
  created_at: string | null
  date_emission: string | null
  date_validite: string | null
  message_client: string | null
  token: string | null
  prestations: Prestation[] | null
  signe_le: string | null
  clients: {
    prenom: string | null
    nom: string | null
    email: string | null
    telephone: string | null
    adresse: string | null
    nom_entreprise: string | null
  } | null
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevisDetailPage() {
  // "token" here is the devis UUID — named to match the [token] folder segment
  const { token: devisId } = useParams<{ token: string }>()
  const router    = useRouter()
  const { toast } = useToast()
  const [devis, setDevis]       = useState<DevisDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('devis')
        .select('id, numero, titre, statut, total_ht, total_tva, total_ttc, created_at, date_emission, date_validite, message_client, token, prestations, signe_le, clients(prenom, nom, email, telephone, adresse, nom_entreprise)')
        .eq('id', devisId)
        .eq('user_id', user.id)
        .single()

      if (!data) {
        setNotFound(true)
      } else {
        setDevis(data as unknown as DevisDetail)
      }
      setLoading(false)
    }
    load()
  }, [devisId, router])

  const publicUrl = devis?.token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/devis/${devis.token}`
    : null

  async function handleCopy() {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast('Lien copié dans le presse-papiers !')
    setTimeout(() => setCopied(false), 2000)
  }

  const mailtoRelance = devis?.token && devis.clients?.email
    ? `mailto:${devis.clients.email}?subject=Relance devis ${devis.numero ?? ''}&body=Bonjour,%0A%0AJe vous relance concernant le devis ${devis.numero ?? ''}.%0A%0AVous pouvez le consulter ici : ${encodeURIComponent(publicUrl ?? '')}`
    : null

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-bold text-kantoo-text">Devis introuvable</h2>
        <p className="mt-1 text-sm text-gray-400">Ce devis n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
        <Link href="/devis" className="mt-4 text-sm font-medium text-orange-500 hover:underline">
          ← Retour aux devis
        </Link>
      </div>
    )
  }

  if (!devis) return null

  const clientName = [devis.clients?.prenom, devis.clients?.nom].filter(Boolean).join(' ') || 'Client inconnu'
  const prestations = (devis.prestations as Prestation[] | null) ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-sm hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-kantoo-text sm:text-2xl">{devis.numero ?? 'Devis'}</h1>
            <Badge status={(devis.statut as DevisStatus) ?? 'brouillon'} />
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-400">{devis.titre ?? 'Sans titre'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Left column */}
        <div className="space-y-5">

          {/* Client */}
          <Card>
            <CardHeader><CardTitle><User className="inline-block mr-1.5 h-4 w-4 text-gray-400" />Client</CardTitle></CardHeader>
            <div className="space-y-1">
              <p className="font-semibold text-kantoo-text">{clientName}</p>
              {devis.clients?.nom_entreprise && (
                <p className="text-sm text-gray-500">{devis.clients.nom_entreprise}</p>
              )}
              {devis.clients?.email && (
                <a href={`mailto:${devis.clients.email}`} className="block text-sm text-orange-500 hover:underline">
                  {devis.clients.email}
                </a>
              )}
              {devis.clients?.telephone && (
                <a href={`tel:${devis.clients.telephone}`} className="block text-sm text-gray-600 hover:text-orange-500">
                  {devis.clients.telephone}
                </a>
              )}
              {devis.clients?.adresse && (
                <p className="text-sm text-gray-500">{devis.clients.adresse}</p>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader><CardTitle><Calendar className="inline-block mr-1.5 h-4 w-4 text-gray-400" />Dates</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Émission</p>
                <p className="mt-1 text-sm font-medium text-kantoo-text">{formatDate(devis.date_emission)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Validité</p>
                <p className="mt-1 text-sm font-medium text-kantoo-text">{formatDate(devis.date_validite)}</p>
              </div>
              {devis.signe_le && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Signé le</p>
                  <p className="mt-1 text-sm font-medium text-green-600">{formatDate(devis.signe_le)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Prestations */}
          {prestations.length > 0 && (
            <Card padding="none">
              <div className="p-5 pb-3">
                <CardHeader className="mb-0">
                  <CardTitle>Prestations</CardTitle>
                  <span className="text-xs text-gray-400">{prestations.length} ligne{prestations.length > 1 ? 's' : ''}</span>
                </CardHeader>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y border-gray-100 bg-gray-50/60">
                      {['Description', 'Qté', 'Unité', 'Prix HT', 'TVA', 'Total HT'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prestations.map((p, i) => {
                      const totalHT = (p.quantite ?? 1) * (p.prixHT ?? 0)
                      return (
                        <tr key={p.id ?? i} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-sm text-kantoo-text">{p.description || '—'}</td>
                          <td className="px-4 py-3 text-sm tabular-nums text-gray-600">{p.quantite}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{p.unite}</td>
                          <td className="px-4 py-3 text-sm tabular-nums text-gray-600">{formatEuros(p.prixHT)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{p.tva} %</td>
                          <td className="px-4 py-3 text-sm font-semibold tabular-nums text-kantoo-text">{formatEuros(totalHT)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Total HT</span>
                  <span className="tabular-nums">{formatEuros(devis.total_ht ?? 0)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA</span>
                  <span className="tabular-nums">{formatEuros(devis.total_tva ?? 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-kantoo-text">
                  <span>Total TTC</span>
                  <span className="tabular-nums text-orange-500">{formatEuros(devis.total_ttc ?? 0)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Message client */}
          {devis.message_client && (
            <Card>
              <CardHeader><CardTitle>Message au client</CardTitle></CardHeader>
              <p className="text-sm leading-relaxed text-gray-600">{devis.message_client}</p>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <div className="space-y-2">

              {devis.statut === 'accepte' && (
                <Link
                  href={`/factures/nouvelle?from=${devis.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-bold text-white shadow-sm shadow-green-200 transition-colors hover:bg-green-600"
                >
                  <FileCheck className="h-4 w-4" />
                  Convertir en facture
                </Link>
              )}

              {publicUrl ? (
                <>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Lien public</p>
                    <p className="break-all text-xs font-mono text-gray-500">{publicUrl}</p>
                  </div>
                  <Button
                    variant="secondary"
                    icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    onClick={handleCopy}
                    className="w-full"
                  >
                    {copied ? 'Lien copié !' : 'Copier le lien'}
                  </Button>
                  {mailtoRelance && (
                    <a
                      href={mailtoRelance}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Mail className="h-4 w-4 text-gray-400" />
                      Relancer par email
                    </a>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                  <Clock className="mx-auto mb-1.5 h-5 w-5 text-gray-300" />
                  <p className="text-xs text-gray-400">Aucun lien — devis en brouillon.</p>
                </div>
              )}
            </div>
          </Card>

          {devis.signe_le && (
            <Card>
              <CardHeader><CardTitle>Signature</CardTitle></CardHeader>
              <p className="text-xs font-semibold text-green-600">✓ Signé le {formatDate(devis.signe_le)}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
