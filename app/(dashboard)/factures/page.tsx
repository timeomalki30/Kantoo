'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileCheck, FileText, Download } from 'lucide-react'

import { Badge }        from '@/components/ui/Badge'
import { Card }         from '@/components/ui/Card'
import { formatEuros }  from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'
import { useToast }     from '@/components/ui/Toast'
import { downloadCsv }  from '@/lib/exportCsv'
import type { DevisStatus } from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Facture {
  id:            string
  numero:        string | null
  titre:         string | null
  total_ht:      number | null
  total_tva:     number | null
  total_ttc:     number | null
  statut:        string | null
  date_emission: string | null
  date_echeance: string | null
  created_at:    string | null
  clients: {
    prenom: string | null
    nom:    string | null
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  )
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function clientName(f: Facture): string {
  return [f.clients?.prenom, f.clients?.nom].filter(Boolean).join(' ') || 'Client inconnu'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FacturesPage() {
  const router    = useRouter()
  const { toast } = useToast()
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('factures')
        .select('id, numero, titre, total_ht, total_tva, total_ttc, statut, date_emission, date_echeance, created_at, clients(prenom, nom)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast('Impossible de charger les factures.', 'error')
      } else {
        setFactures((data ?? []) as unknown as Facture[])
      }
      setLoading(false)
    }
    load()
  }, [router, toast])

  // ── Export CSV ──────────────────────────────────────────────────────────────

  function handleExport() {
    const payees = factures.filter((f) => f.statut === 'payee' || f.statut === 'paye')
    const headers = ['Numéro', 'Client', 'Titre', 'Montant HT (€)', 'TVA (€)', 'Montant TTC (€)', 'Date émission', 'Date échéance', 'Statut']
    const rows = payees.map((f) => [
      f.numero ?? '',
      clientName(f),
      f.titre ?? '',
      (f.total_ht ?? 0).toFixed(2).replace('.', ','),
      (f.total_tva ?? 0).toFixed(2).replace('.', ','),
      (f.total_ttc ?? 0).toFixed(2).replace('.', ','),
      f.date_emission ? new Date(f.date_emission).toLocaleDateString('fr-FR') : '',
      f.date_echeance ? new Date(f.date_echeance).toLocaleDateString('fr-FR') : '',
      f.statut ?? '',
    ])
    downloadCsv(`factures-payees-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const encaisse  = factures
    .filter((f) => f.statut === 'payee' || f.statut === 'paye')
    .reduce((s, f) => s + (f.total_ttc ?? 0), 0)

  const enAttente = factures
    .filter((f) => f.statut === 'envoyee')
    .reduce((s, f) => s + (f.total_ttc ?? 0), 0)

  const enRetard  = factures
    .filter((f) => f.statut === 'en_retard')
    .reduce((s, f) => s + (f.total_ttc ?? 0), 0)

  const summary = [
    { label: 'Total encaissé', value: formatEuros(encaisse),  color: 'text-green-600', bg: 'bg-green-50'  },
    { label: 'En attente',     value: formatEuros(enAttente), color: 'text-sky-600',   bg: 'bg-sky-50'    },
    { label: 'En retard',      value: formatEuros(enRetard),  color: 'text-rose-600',  bg: 'bg-rose-50'   },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Factures</h1>
          <p className="mt-1 text-sm text-gray-400">
            {loading ? 'Chargement…' : `${factures.length} facture${factures.length !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && factures.some((f) => f.statut === 'payee' || f.statut === 'paye') && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Exporter factures payées
            </button>
          )}
          <Link
            href="/factures/nouvelle"
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {summary.map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl ${bg} px-4 py-3`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && <TableSkeleton />}

      {/* Empty state */}
      {!loading && factures.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <FileCheck className="mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-sm font-semibold text-kantoo-text">Aucune facture pour l&apos;instant</h3>
          <p className="mt-1 text-sm text-gray-400">
            Créez votre première facture ou convertissez un devis accepté.
          </p>
          <Link
            href="/factures/nouvelle"
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Créer une facture
          </Link>
        </div>
      )}

      {/* Table — desktop */}
      {!loading && factures.length > 0 && (
        <Card padding="none" className="hidden overflow-hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Client', 'Titre', 'Montant TTC', 'Statut', 'Échéance', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 last:w-10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factures.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-gray-100 transition-colors last:border-0 hover:bg-orange-50/30 ${
                    i % 2 === 1 ? 'bg-gray-50/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-kantoo-text">{clientName(f)}</p>
                    <p className="text-xs text-gray-400">{f.numero ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{f.titre ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-bold tabular-nums text-kantoo-text">
                    {formatEuros(f.total_ttc ?? 0)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={(f.statut === 'payee' ? 'paye' : f.statut ?? 'brouillon') as DevisStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(f.date_echeance)}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/factures/${f.id}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Cards — mobile */}
      {!loading && factures.length > 0 && (
        <div className="space-y-2 sm:hidden">
          {factures.map((f) => (
            <Card key={f.id} padding="sm" hover className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <FileCheck className="h-4 w-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-kantoo-text">{clientName(f)}</p>
                  <Badge status={(f.statut === 'payee' ? 'paye' : f.statut ?? 'brouillon') as DevisStatus} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-gray-400">{f.titre ?? '—'}</p>
                  <p className="shrink-0 text-xs font-bold tabular-nums text-kantoo-text">
                    {formatEuros(f.total_ttc ?? 0)}
                  </p>
                </div>
                {f.date_echeance && (
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Échéance : {formatDate(f.date_echeance)}
                  </p>
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
