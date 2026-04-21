'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Users, FileText, Bell,
  TrendingUp, Clock, Banknote, Percent,
  ChevronRight, CheckCircle2, Circle, BarChart3,
} from 'lucide-react'
import { Badge }       from '@/components/ui/Badge'
import { Card }        from '@/components/ui/Card'
import { formatEuros } from '@/lib/devis'
import { createClient } from '@/lib/supabase/client'
import type { DevisStatus } from '@/components/ui/Badge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DevisRow {
  id: string
  numero: string | null
  titre: string | null
  statut: string | null
  total_ttc: number | null
  created_at: string | null
  date_emission: string | null
  token: string | null
  clients: { prenom: string | null; nom: string | null } | null
}

interface DashData {
  prenom: string
  devis: DevisRow[]
  clientsCount: number
  profileComplete: boolean
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
}

function MetricSkeleton() {
  return (
    <Card padding="sm" className="h-full">
      <Skeleton className="mb-3 h-9 w-9 rounded-xl" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-28 mb-2" />
      <Skeleton className="h-3 w-24" />
    </Card>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfMonth(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr)
  return Math.floor((Date.now() - d.getTime()) / 86_400_000)
}

function clientName(devis: DevisRow): string {
  if (!devis.clients) return 'Client inconnu'
  const { prenom, nom } = devis.clients
  return [prenom, nom].filter(Boolean).join(' ') || 'Client inconnu'
}

// ─── Premiers pas checklist ───────────────────────────────────────────────────

function PremieresPas({
  profileComplete,
  clientsCount,
  devisCount,
}: {
  profileComplete: boolean
  clientsCount: number
  devisCount: number
}) {
  const items = [
    { label: 'Complète ton profil entreprise', done: profileComplete, href: '/compte' },
    { label: 'Crée ton premier client',        done: clientsCount > 0, href: '/clients/nouveau' },
    { label: 'Envoie ton premier devis',       done: devisCount > 0,  href: '/devis/nouveau' },
  ]
  const done = items.filter((i) => i.done).length
  const pct = Math.round((done / items.length) * 100)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-kantoo-text">Premiers pas</h2>
        <span className="text-sm font-semibold text-orange-500">{done}/{items.length}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.done ? '#' : item.href}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                item.done
                  ? 'bg-green-50 cursor-default'
                  : 'bg-gray-50 hover:bg-orange-50'
              }`}
            >
              {item.done
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                : <Circle       className="h-5 w-5 shrink-0 text-gray-300" />
              }
              <span className={`text-sm font-medium ${
                item.done ? 'text-green-700 line-through decoration-green-400' : 'text-kantoo-text'
              }`}>
                {item.label}
              </span>
              {!item.done && (
                <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {done === items.length && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          🎉 Tu as complété toutes les étapes de démarrage !
        </div>
      )}
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]       = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)

  const today = useMemo(() => {
    const s = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date())
    return s.charAt(0).toUpperCase() + s.slice(1)
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [profileRes, devisRes, clientsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('prenom, nom_entreprise')
          .eq('id', user.id)
          .single(),
        supabase
          .from('devis')
          .select('id, numero, titre, statut, total_ttc, created_at, date_emission, token, clients(prenom, nom)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ])

      setData({
        prenom:          profileRes.data?.prenom ?? 'Artisan',
        devis:           (devisRes.data ?? []) as unknown as DevisRow[],
        clientsCount:    clientsRes.count ?? 0,
        profileComplete: !!profileRes.data?.nom_entreprise,
      })
      setLoading(false)
    }
    load()
  }, [])

  // ── Computed metrics ──────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (!data) return null
    const { devis } = data
    const monthStart = startOfMonth()

    const devisMois    = devis.filter((d) => (d.created_at ?? '') >= monthStart).length
    const enAttenteTTC = devis
      .filter((d) => d.statut === 'en_attente')
      .reduce((s, d) => s + (d.total_ttc ?? 0), 0)
    const encaisseTTC  = devis
      .filter((d) => d.statut === 'accepte' || d.statut === 'paye')
      .filter((d) => (d.created_at ?? '') >= monthStart)
      .reduce((s, d) => s + (d.total_ttc ?? 0), 0)

    const decided = devis.filter((d) =>
      ['accepte', 'paye', 'refuse'].includes(d.statut ?? '')
    ).length
    const accepted = devis.filter((d) =>
      d.statut === 'accepte' || d.statut === 'paye'
    ).length
    const tauxAccept = decided > 0 ? Math.round((accepted / decided) * 100) : 0

    return [
      {
        label: 'Devis ce mois',
        value: String(devisMois),
        sub:   `${devis.length} au total`,
        icon:  FileText,
        color: 'text-blue-500',
        bg:    'bg-blue-50',
      },
      {
        label: 'En attente',
        value: formatEuros(enAttenteTTC),
        sub:   `${devis.filter((d) => d.statut === 'en_attente').length} devis sans réponse`,
        icon:  Clock,
        color: 'text-amber-500',
        bg:    'bg-amber-50',
      },
      {
        label: 'Encaissé',
        value: formatEuros(encaisseTTC),
        sub:   'Ce mois',
        icon:  Banknote,
        color: 'text-green-500',
        bg:    'bg-green-50',
      },
      {
        label: "Taux d'acceptation",
        value: `${tauxAccept} %`,
        sub:   decided > 0 ? `sur ${decided} devis` : 'Pas encore de données',
        icon:  Percent,
        color: 'text-orange-500',
        bg:    'bg-orange-50',
      },
    ]
  }, [data])

  const derniersDevis = useMemo(
    () => (data?.devis ?? []).slice(0, 5),
    [data]
  )

  const aRelancer = useMemo(
    () =>
      (data?.devis ?? []).filter(
        (d) => d.statut === 'en_attente' && daysAgo(d.date_emission ?? d.created_at ?? '') >= 7
      ),
    [data]
  )

  const isEmpty = !loading && data && data.devis.length === 0 && data.clientsCount === 0

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">
            {loading
              ? 'Bonjour 👋'
              : `Bonjour ${data?.prenom ?? ''} 👋`}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{today}</p>
        </div>
        <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50">
          <Bell className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
          : metrics?.map((m, i) => (
            <div key={m.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Card padding="sm" className="h-full transition-shadow duration-200 hover:shadow-card-hover">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${m.bg}`}>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{m.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-kantoo-text sm:text-2xl">{m.value}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {m.sub}
                </p>
              </Card>
            </div>
          ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-base font-bold text-kantoo-text">Actions rapides</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/devis/nouveau"
            className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-orange-500 text-base font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] sm:flex-initial sm:px-8"
          >
            <Plus className="h-5 w-5" />
            Nouveau devis
          </Link>
          <div className="flex gap-3">
            <Link
              href="/clients/nouveau"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98] sm:flex-initial"
            >
              <Users className="h-4 w-4 text-gray-400" />
              Nouveau client
            </Link>
            <Link
              href="/devis"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98] sm:flex-initial"
            >
              <BarChart3 className="h-4 w-4 text-gray-400" />
              Voir les devis
            </Link>
          </div>
        </div>
      </div>

      {/* Empty state — Premiers pas */}
      {isEmpty && (
        <div className="animate-fade-in-up" style={{ animationDelay: '340ms' }}>
          <PremieresPas
            profileComplete={data!.profileComplete}
            clientsCount={data!.clientsCount}
            devisCount={data!.devis.length}
          />
        </div>
      )}

      {/* Derniers devis (only if data exists) */}
      {!loading && !isEmpty && derniersDevis.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '420ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-kantoo-text">Derniers devis</h2>
            <Link href="/devis" className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <Card padding="none" className="hidden overflow-hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Client', 'Chantier', 'Montant TTC', 'Statut', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {derniersDevis.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`border-b border-gray-100 transition-colors last:border-0 hover:bg-orange-50/30 cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                    onClick={() => window.location.href = `/devis/${d.id}/detail`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-kantoo-text">{clientName(d)}</p>
                      <p className="text-xs text-gray-400">{d.numero}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{d.titre ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-bold tabular-nums text-kantoo-text">
                      {formatEuros(d.total_ttc ?? 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={(d.statut as DevisStatus) ?? 'brouillon'} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">
                      {d.created_at ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(d.created_at)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-2 sm:hidden">
            {derniersDevis.map((d) => (
              <Link key={d.id} href={`/devis/${d.id}/detail`}>
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
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* À relancer */}
      {!loading && aRelancer.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h2 className="mb-4 text-base font-bold text-kantoo-text">À relancer</h2>
          <div className="space-y-3">
            {aRelancer.map((d) => {
              const jours = daysAgo(d.date_emission ?? d.created_at ?? '')
              return (
                <div key={d.id} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <p className="text-sm font-bold text-kantoo-text">{clientName(d)}</p>
                        <span className="text-xs text-gray-400">{d.numero}</span>
                      </div>
                      <p className="truncate text-sm text-gray-600">{d.titre ?? '—'}</p>
                      <p className="mt-0.5 text-xs font-medium text-amber-700">
                        ⏱ Envoyé il y a {jours} jours · {formatEuros(d.total_ttc ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <Link
                      href={`/devis/${d.id}/detail`}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-600 sm:flex-initial"
                    >
                      <Bell className="h-4 w-4" />
                      Relancer
                    </Link>
                    <Link
                      href={`/devis/${d.id}/detail`}
                      className="flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-amber-50"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
