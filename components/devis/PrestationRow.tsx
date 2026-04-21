'use client'

import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import type { Prestation, TVARate, Unite } from '@/types/devis'
import { formatEuros } from '@/lib/devis'

const UNITES: { value: Unite; label: string }[] = [
  { value: 'h',       label: 'h' },
  { value: 'forfait', label: 'Forfait' },
  { value: 'm²',      label: 'm²' },
  { value: 'm',       label: 'm' },
  { value: 'm³',      label: 'm³' },
  { value: 'u',       label: 'u' },
]

const TVA_RATES: { value: TVARate; label: string }[] = [
  { value: 0,  label: '0 %' },
  { value: 10, label: '10 %' },
  { value: 20, label: '20 %' },
]

interface PrestationRowProps {
  prestation: Prestation
  index: number
  onChange: (updated: Prestation) => void
  onRemove: () => void
  canRemove: boolean
  touch?: boolean
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-2 py-2 align-top', className)}>{children}</td>
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-kantoo-text ' +
  'placeholder:text-gray-400 shadow-sm transition-all hover:border-gray-300 ' +
  'focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ' +
  'disabled:bg-gray-50'

const selectCls =
  inputCls +
  ' cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")] bg-[right_8px_center] bg-no-repeat pr-7'

export function PrestationRow({ prestation: p, index, onChange, onRemove, canRemove }: PrestationRowProps) {
  function set<K extends keyof Prestation>(key: K, value: Prestation[K]) {
    onChange({ ...p, [key]: value })
  }

  const totalLigne = p.quantite * p.prixHT

  return (
    <tr className="group border-b border-gray-100 last:border-0">
      <Cell className="w-6 text-center">
        <span className="text-xs font-medium text-gray-400">{index + 1}</span>
      </Cell>

      {/* Description */}
      <Cell className="min-w-[200px]">
        <input
          className={inputCls}
          placeholder="Ex : Pose de carrelage..."
          value={p.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Cell>

      {/* Quantité */}
      <Cell className="w-24">
        <input
          className={cn(inputCls, 'text-right')}
          type="number"
          min="0"
          step="0.5"
          placeholder="1"
          value={p.quantite || ''}
          onChange={(e) => set('quantite', parseFloat(e.target.value) || 0)}
        />
      </Cell>

      {/* Unité */}
      <Cell className="w-24">
        <select
          className={selectCls}
          value={p.unite}
          onChange={(e) => set('unite', e.target.value as Unite)}
        >
          {UNITES.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </Cell>

      {/* Prix HT */}
      <Cell className="w-28">
        <div className="relative">
          <input
            className={cn(inputCls, 'pr-6 text-right')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={p.prixHT || ''}
            onChange={(e) => set('prixHT', parseFloat(e.target.value) || 0)}
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
        </div>
      </Cell>

      {/* TVA */}
      <Cell className="w-24">
        <select
          className={selectCls}
          value={p.tva}
          onChange={(e) => set('tva', parseInt(e.target.value) as TVARate)}
        >
          {TVA_RATES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Cell>

      {/* Total HT */}
      <Cell className="w-28 text-right">
        <span className="text-sm font-medium text-kantoo-text">
          {formatEuros(totalLigne)}
        </span>
      </Cell>

      {/* Supprimer */}
      <Cell className="w-10 text-center">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            aria-label="Supprimer la ligne"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </Cell>
    </tr>
  )
}

// ─── Version mobile (cards empilées) ─────────────────────────────────────────

export function PrestationCard({ prestation: p, index, onChange, onRemove, canRemove, touch = false }: PrestationRowProps) {
  function set<K extends keyof Prestation>(key: K, value: Prestation[K]) {
    onChange({ ...p, [key]: value })
  }

  const totalLigne = p.quantite * p.prixHT

  // Touch mode: bigger inputs (min-h-[48px]) for thumb ergonomics
  const iCls = touch
    ? cn(inputCls, 'py-3 text-base min-h-[48px]')
    : inputCls
  const sCls = touch
    ? cn(selectCls, 'py-3 text-base min-h-[48px]')
    : selectCls

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Prestation {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 active:scale-95"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-600">Description</label>
          <input
            className={iCls}
            placeholder="Ex : Pose de carrelage..."
            value={p.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">Quantité</label>
            <input
              className={cn(iCls, 'text-right')}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={p.quantite || ''}
              onChange={(e) => set('quantite', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">Unité</label>
            <select className={sCls} value={p.unite} onChange={(e) => set('unite', e.target.value as Unite)}>
              {UNITES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">Prix HT (€)</label>
            <input
              className={cn(iCls, 'text-right')}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={p.prixHT || ''}
              onChange={(e) => set('prixHT', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-600">TVA</label>
            <select className={sCls} value={p.tva} onChange={(e) => set('tva', parseInt(e.target.value) as TVARate)}>
              {TVA_RATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-500">Total HT</span>
          <span className="text-base font-bold text-kantoo-text">{formatEuros(totalLigne)}</span>
        </div>
      </div>
    </div>
  )
}
