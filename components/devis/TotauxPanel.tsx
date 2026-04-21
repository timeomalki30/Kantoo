import { cn } from '@/lib/utils'
import { formatEuros } from '@/lib/devis'
import type { TotauxDevis } from '@/types/devis'

interface TotauxPanelProps {
  totaux: TotauxDevis
  className?: string
}

export function TotauxPanel({ totaux, className }: TotauxPanelProps) {
  return (
    <div className={cn('rounded-card border border-gray-100 bg-white shadow-card', className)}>
      <div className="p-5 pb-3">
        <h3 className="text-sm font-semibold text-kantoo-text">Récapitulatif</h3>
      </div>

      <div className="space-y-2 px-5 pb-4">
        <Row label="Total HT" value={formatEuros(totaux.totalHT)} />

        {totaux.tvaDetails.map((t) => (
          <Row
            key={t.taux}
            label={`TVA ${t.taux} %`}
            value={formatEuros(t.montant)}
            sub
          />
        ))}

        {totaux.totalTVA === 0 && (
          <Row label="TVA" value="0,00 €" sub />
        )}
      </div>

      {/* TTC highlight */}
      <div className="mx-4 mb-4 rounded-xl bg-orange-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-orange-900">Total TTC</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatEuros(totaux.totalTTC)}
          </span>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  sub = false,
}: {
  label: string
  value: string
  sub?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm', sub ? 'text-gray-400' : 'text-gray-600')}>
        {label}
      </span>
      <span className={cn('text-sm font-medium', sub ? 'text-gray-500' : 'text-kantoo-text')}>
        {value}
      </span>
    </div>
  )
}
