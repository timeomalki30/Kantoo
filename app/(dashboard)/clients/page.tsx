'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Phone, Mail, FileText, Users } from 'lucide-react'
import { Card }         from '@/components/ui/Card'
import { formatEuros }  from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string
  prenom: string | null
  nom: string | null
  email: string | null
  telephone: string | null
  nom_entreprise: string | null
  type: string | null
}

interface ClientWithStats extends ClientRow {
  nbDevis: number
  montantTotal: number
}

function getInitials(c: ClientRow): string {
  const p = c.prenom?.[0] ?? ''
  const n = c.nom?.[0] ?? ''
  return (p + n).toUpperCase() || '?'
}

function getFullName(c: ClientRow): string {
  return [c.prenom, c.nom].filter(Boolean).join(' ') || c.nom_entreprise || 'Client sans nom'
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-pink-100 text-pink-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-amber-100 text-amber-600',
  'bg-teal-100 text-teal-600',
  'bg-rose-100 text-rose-600',
  'bg-indigo-100 text-indigo-600',
]

function avatarColor(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function CardSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="h-1.5 bg-gray-100" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Fetch clients + their devis stats in parallel
    const [clientsRes, devisRes] = await Promise.all([
      supabase
        .from('clients')
        .select('id, prenom, nom, email, telephone, nom_entreprise, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('devis')
        .select('client_id, total_ttc')
        .eq('user_id', user.id),
    ])

    const devisData = devisRes.data ?? []

    const enriched: ClientWithStats[] = (clientsRes.data ?? []).map((c) => {
      const clientDevis = devisData.filter((d) => d.client_id === c.id)
      return {
        ...c,
        nbDevis:      clientDevis.length,
        montantTotal: clientDevis.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      }
    })

    setClients(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        getFullName(c).toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.telephone ?? '').includes(q) ||
        (c.nom_entreprise ?? '').toLowerCase().includes(q)
    )
  }, [clients, search])

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-gray-400">
            {loading ? '…' : `${clients.length} client${clients.length > 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Link
          href="/clients/nouveau"
          className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Rechercher un client, email, téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-kantoo-text placeholder:text-gray-400 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state — no clients */}
      {!loading && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Aucun client pour l&apos;instant</p>
          <p className="mt-1 text-xs text-gray-400">Ajoutez votre premier client pour commencer.</p>
          <Link
            href="/clients/nouveau"
            className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Ajouter un client
          </Link>
        </div>
      )}

      {/* Empty search state */}
      {!loading && clients.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <Search className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Aucun client trouvé</p>
          <p className="mt-1 text-xs text-gray-400">Modifiez votre recherche.</p>
        </div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} padding="none" hover className="flex flex-col overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />
              <div className="flex flex-col gap-4 p-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(c.id)}`}>
                    {getInitials(c)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-kantoo-text">{getFullName(c)}</p>
                    <p className="truncate text-xs text-gray-400">
                      {c.type === 'professionnel' && c.nom_entreprise
                        ? c.nom_entreprise
                        : c.type === 'professionnel' ? 'Professionnel' : 'Particulier'}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1.5">
                  {c.telephone && (
                    <a
                      href={`tel:${c.telephone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-orange-500"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{c.telephone}</span>
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-2 truncate text-sm text-gray-600 transition-colors hover:text-orange-500"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-semibold text-kantoo-text">{c.nbDevis}</span>
                    {' '}devis
                  </div>
                  <div className="text-xs font-bold tabular-nums text-orange-500">
                    {formatEuros(c.montantTotal)}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/devis/nouveau`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau devis
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
