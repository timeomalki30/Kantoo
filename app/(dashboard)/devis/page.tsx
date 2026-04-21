'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Search, Link2, Copy, Check, X, Bell } from 'lucide-react'
import { Badge }        from '@/components/ui/Badge'
import { Card }         from '@/components/ui/Card'
import { Button }       from '@/components/ui/Button'
import { formatEuros }  from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'
import { useToast }     from '@/components/ui/Toast'
import type { DevisStatus } from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DevisRow {
  id: string
  numero: string | null
  titre: string | null
  statut: string | null
  total_ttc: number | null
  created_at: string | null
  token: string | null
  clients: { prenom: string | null; nom: string | null } | null
}

type FilterKey = 'tous' | DevisStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'tous',       label: 'Tous'       },
  { key: 'brouillon',  label: 'Brouillon'  },
  { key: 'en_attente', label: 'En attente' },
  { key: 'accepte',    label: 'Accepté'    },
  { key: 'paye',       label: 'Payé'       },
  { key: 'refuse',     label: 'Refusé'     },
]

function clientName(d: DevisRow): string {
  if (!d.clients) return 'Client inconnu'
  const { prenom, nom } = d.clients
  return [prenom, nom].filter(Boolean).join(' ') || 'Client inconnu'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function TableSkeleton() {
  return (
    <Card padding="none" className="hidden overflow-hidden sm:block">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3 flex gap-8">
        {['Numéro', 'Client', 'Chantier', 'Montant TTC', 'Statut', 'Date', ''].map((h) => (
          <Skeleton key={h} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-8 border-b border-gray-100 px-5 py-4 last:border-0">
          {Array.from({ length: 7 }).map((__, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </Card>
  )
}

// ─── Relancer Modal ───────────────────────────────────────────────────────────

function RelancerModal({
  devis,
  onClose,
}: {
  devis: DevisRow
  onClose: () => void
}) {
  const { toast }     = useToast()
  const [copied, setCopied] = useState(false)

  const publicUrl = devis.token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/devis/${devis.token}`
    : null

  async function handleCopy() {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast('Lien copié dans le presse-papiers !')
    setTimeout(() => setCopied(false), 2000)
  }

  const mailtoHref = devis.token
    ? `mailto:?subject=Relance%20devis%20${devis.numero ?? ''}&body=Bonjour%2C%0A%0AJe%20me%20permets%20de%20vous%20relancer%20concernant%20le%20devis%20${devis.numero ?? ''}%20en%20attente%20de%20votre%20validation.%0A%0AVous%20pouvez%20le%20consulter%20et%20le%20signer%20ici%20%3A%0A${encodeURIComponent(publicUrl ?? '')}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-kantoo-text">Relancer le client</h3>
            <p className="mt-0.5 text-sm text-gray-500">{devis.numero} · {clientName(devis)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {publicUrl ? (
          <>
            <div className="mb-4 rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Lien du devis</p>
              <p className="break-all text-xs font-mono text-gray-600">{publicUrl}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                onClick={handleCopy}
                className="w-full"
              >
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
              {mailtoHref && (
                <a
                  href={mailtoHref}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4 text-gray-400" />
                  Envoyer par email
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Ce devis n&apos;a pas encore de lien public. Envoyez-le d&apos;abord au client.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevisPage() {
  const router                                    = useRouter()
  const [devis, setDevis]                         = useState<DevisRow[]>([])
  const [loading, setLoading]                     = useState(true)
  const [search, setSearch]                       = useState('')
  const [activeFilter, setFilter]                 = useState<FilterKey>('tous')
  const [relancerTarget, setRelancerTarget]       = useState<DevisRow | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('devis')
      .select('id, numero, titre, statut, total_ttc, created_at, token, clients(prenom, nom)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setDevis((data ?? []) as unknown as DevisRow[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    return devis.filter((d) => {
      const matchFilter = activeFilter === 'tous' || d.statut === activeFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        clientName(d).toLowerCase().includes(q) ||
        (d.titre ?? '').toLowerCase().includes(q) ||
        (d.numero ?? '').toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [devis, search, activeFilter])

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Devis</h1>
          <p className="mt-1 text-sm text-gray-400">
            {loading ? '…' : `${devis.length} devis au total`}
          </p>
        </div>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher un client, chantier, numéro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-kantoo-text placeholder:text-gray-400 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const count = f.key === 'tous'
              ? devis.length
              : devis.filter((d) => d.statut === f.key).length
            const active = activeFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <TableSkeleton />}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {devis.length === 0 ? 'Aucun devis pour l\'instant' : 'Aucun devis trouvé'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {devis.length === 0
              ? 'Créez votre premier devis en quelques clics.'
              : 'Modifiez vos filtres ou créez un nouveau devis.'}
          </p>
          {devis.length === 0 && (
            <Link
              href="/devis/nouveau"
              className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Créer mon premier devis
            </Link>
          )}
        </div>
      )}

      {/* Table — desktop */}
      {!loading && filtered.length > 0 && (
        <Card padding="none" className="hidden overflow-hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Numéro', 'Client', 'Chantier', 'Montant TTC', 'Statut', 'Date', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 last:w-28">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  className={`border-b border-gray-100 transition-colors last:border-0 hover:bg-orange-50/30 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400 cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    {d.numero ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    <p className="text-sm font-semibold text-kantoo-text">{clientName(d)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    {d.titre ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold tabular-nums text-kantoo-text cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    {formatEuros(d.total_ttc ?? 0)}
                  </td>
                  <td className="px-5 py-3.5 cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    <Badge status={(d.statut as DevisStatus) ?? 'brouillon'} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 cursor-pointer" onClick={() => router.push(`/devis/${d.id}/detail`)}>
                    {formatDate(d.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    {d.statut === 'en_attente' && (
                      <button
                        onClick={() => setRelancerTarget(d)}
                        className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                      >
                        <Bell className="h-3 w-3" />
                        Relancer
                      </button>
                    )}
                    {d.token && d.statut !== 'en_attente' && (
                      <button
                        onClick={() => setRelancerTarget(d)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        <Link2 className="h-3 w-3" />
                        Lien
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Cards — mobile */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2 sm:hidden">
          {filtered.map((d) => (
            <div key={d.id} className="group relative">
              <Link href={`/devis/${d.id}/detail`}>
                <Card padding="sm" hover className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-kantoo-text">{clientName(d)}</p>
                      <Badge status={(d.statut as DevisStatus) ?? 'brouillon'} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-gray-400">{d.titre ?? '—'}</p>
                      <p className="shrink-0 text-xs font-bold tabular-nums text-kantoo-text">
                        {formatEuros(d.total_ttc ?? 0)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-400">{d.numero} · {formatDate(d.created_at)}</p>
                  </div>
                </Card>
              </Link>
              {d.statut === 'en_attente' && (
                <button
                  onClick={() => setRelancerTarget(d)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                >
                  <Bell className="h-3 w-3" />
                  Relancer
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="h-2" />

      {/* Relancer modal */}
      {relancerTarget && (
        <RelancerModal
          devis={relancerTarget}
          onClose={() => setRelancerTarget(null)}
        />
      )}
    </div>
  )
}
