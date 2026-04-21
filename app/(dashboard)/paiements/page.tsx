'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, Clock, TrendingUp, CreditCard, FileText } from 'lucide-react'

import { Badge }        from '@/components/ui/Badge'
import { Card }         from '@/components/ui/Card'
import { formatEuros }  from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'
import { useToast }     from '@/components/ui/Toast'
import type { DevisStatus } from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id:        string
  reference: string | null
  client:    string
  montant:   number
  date:      string | null
  type:      'devis' | 'facture'
  statut:    string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaiementsPage() {
  const router    = useRouter()
  const { toast } = useToast()
  const [loading,        setLoading]        = useState(true)
  const [history,        setHistory]        = useState<Transaction[]>([])
  const [totalEncaisse,  setTotalEncaisse]  = useState(0)
  const [ceMois,         setCeMois]         = useState(0)
  const [enAttenteMont,  setEnAttenteMont]  = useState(0)
  const [enAttenteCount, setEnAttenteCount] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const now          = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Fetch factures + devis in parallel
      const [facturesRes, devisRes] = await Promise.all([
        supabase
          .from('factures')
          .select('id, numero, total_ttc, statut, created_at, clients(prenom, nom)')
          .eq('user_id', user.id),
        supabase
          .from('devis')
          .select('id, numero, total_ttc, statut, created_at, clients(prenom, nom)')
          .eq('user_id', user.id),
      ])

      if (facturesRes.error || devisRes.error) {
        toast('Impossible de charger les paiements.', 'error')
        setLoading(false)
        return
      }

      type RawRow = {
        id: string
        numero: string | null
        total_ttc: number | null
        statut: string | null
        created_at: string | null
        clients: { prenom: string | null; nom: string | null } | null
      }

      const factures = (facturesRes.data ?? []) as unknown as RawRow[]
      const devis    = (devisRes.data    ?? []) as unknown as RawRow[]

      function rowName(r: RawRow) {
        return [r.clients?.prenom, r.clients?.nom].filter(Boolean).join(' ') || 'Client inconnu'
      }

      // ── Paiements reçus (history) ────────────────────────────────────────
      const paidFactures: Transaction[] = factures
        .filter((f) => f.statut === 'payee' || f.statut === 'paye')
        .map((f) => ({
          id:        f.id,
          reference: f.numero,
          client:    rowName(f),
          montant:   f.total_ttc ?? 0,
          date:      f.created_at,
          type:      'facture',
          statut:    'paye',
        }))

      const paidDevis: Transaction[] = devis
        .filter((d) => d.statut === 'paye')
        .map((d) => ({
          id:        d.id,
          reference: d.numero,
          client:    rowName(d),
          montant:   d.total_ttc ?? 0,
          date:      d.created_at,
          type:      'devis',
          statut:    'paye',
        }))

      const allPaid = [...paidFactures, ...paidDevis].sort(
        (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
      )
      setHistory(allPaid)

      // ── Metrics ─────────────────────────────────────────────────────────
      const total = allPaid.reduce((s, r) => s + r.montant, 0)
      setTotalEncaisse(total)

      const thisMo = allPaid
        .filter((r) => r.date && r.date >= startOfMonth)
        .reduce((s, r) => s + r.montant, 0)
      setCeMois(thisMo)

      // En attente: factures envoyées + en_retard + devis en_attente + accepté
      const pendingRows = [
        ...factures.filter((f) => f.statut === 'envoyee' || f.statut === 'en_retard'),
        ...devis.filter((d) => d.statut === 'en_attente' || d.statut === 'accepte'),
      ]
      setEnAttenteMont(pendingRows.reduce((s, r) => s + (r.total_ttc ?? 0), 0))
      setEnAttenteCount(pendingRows.length)

      setLoading(false)
    }
    load()
  }, [router, toast])

  const currentMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())

  const metrics = [
    {
      label: 'Total encaissé',
      value: formatEuros(totalEncaisse),
      sub:   'Tous les paiements reçus',
      icon:  Banknote,
      color: 'text-green-600',
      bg:    'bg-green-50',
    },
    {
      label: `Ce mois (${currentMonth})`,
      value: formatEuros(ceMois),
      sub:   `Paiements reçus en ${currentMonth}`,
      icon:  TrendingUp,
      color: 'text-blue-600',
      bg:    'bg-blue-50',
    },
    {
      label: 'En attente',
      value: formatEuros(enAttenteMont),
      sub:   `${enAttenteCount} paiement${enAttenteCount !== 1 ? 's' : ''} à recevoir`,
      icon:  Clock,
      color: 'text-amber-600',
      bg:    'bg-amber-50',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Paiements</h1>
        <p className="mt-1 text-sm text-gray-400">
          {loading ? 'Chargement…' : `${history.length} paiement${history.length !== 1 ? 's' : ''} reçu${history.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className={`flex items-center gap-4 rounded-2xl ${m.bg} px-5 py-4`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{m.label}</p>
                <p className={`mt-0.5 text-xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
                <p className="mt-0.5 truncate text-[11px] text-gray-400">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <CreditCard className="mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-sm font-semibold text-kantoo-text">Aucun paiement enregistré</h3>
          <p className="mt-1 text-sm text-gray-400">
            Les paiements apparaîtront ici dès qu&apos;une facture sera marquée comme payée.
          </p>
        </div>
      )}

      {/* Table — desktop */}
      {!loading && history.length > 0 && (
        <Card padding="none" className="hidden overflow-hidden sm:block">
          <div className="border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-kantoo-text">Historique des paiements reçus</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Client', 'Référence', 'Type', 'Montant', 'Statut', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((t, i) => (
                <tr
                  key={`${t.type}-${t.id}`}
                  className={`border-b border-gray-100 transition-colors last:border-0 hover:bg-orange-50/30 ${
                    i % 2 === 1 ? 'bg-gray-50/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-kantoo-text">{t.client}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-mono text-xs text-gray-400">{t.reference ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.type === 'facture'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      {t.type === 'facture' ? 'Facture' : 'Devis'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold tabular-nums text-kantoo-text">
                    {formatEuros(t.montant)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={(t.statut as DevisStatus) ?? 'paye'} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Cards — mobile */}
      {!loading && history.length > 0 && (
        <div className="space-y-2 sm:hidden">
          {history.map((t) => (
            <Card key={`${t.type}-${t.id}`} padding="sm" className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-kantoo-text">{t.client}</p>
                  <Badge status={(t.statut as DevisStatus) ?? 'paye'} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-gray-400">
                    {t.reference ?? '—'} · {t.type === 'facture' ? 'Facture' : 'Devis'}
                  </p>
                  <p className="shrink-0 text-xs font-bold tabular-nums text-kantoo-text">
                    {formatEuros(t.montant)}
                  </p>
                </div>
                {t.date && (
                  <p className="mt-0.5 text-[10px] text-gray-400">{formatDate(t.date)}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
