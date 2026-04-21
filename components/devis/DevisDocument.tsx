import { Logo } from '@/components/ui/Logo'
import { formatEuros } from '@/lib/devis'
import type { DevisForm, TotauxDevis } from '@/types/devis'

interface Artisan {
  name:    string
  email:   string
  phone?:  string
  address?: string
  siret?:  string
}

const CONDITIONS_LABEL: Record<string, string> = {
  comptant: 'Comptant à réception',
  '30j':    '30 jours fin de mois',
  '45j':    '45 jours fin de mois',
  '60j':    '60 jours fin de mois',
}

interface DevisDocumentProps {
  form:    DevisForm
  totaux:  TotauxDevis
  artisan: Artisan
  factureMode?:        boolean
  echeanceDate?:       string
  conditionsPaiement?: string
  tvaNonApplicable?:   boolean
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

function fmtExpiry(date: string, jours: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + jours)
  return fmt(d.toISOString().split('T')[0])
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </p>
  )
}

// ─── Main document ────────────────────────────────────────────────────────────

export function DevisDocument({
  form,
  totaux,
  artisan,
  factureMode = false,
  echeanceDate,
  conditionsPaiement,
  tvaNonApplicable = false,
}: DevisDocumentProps) {
  const hasClient = form.client.nom || form.client.email

  // Table columns depending on TVA mode
  const cols = tvaNonApplicable
    ? [
        { label: 'Description', cls: 'text-left  px-4 py-3 font-semibold' },
        { label: 'Qté',         cls: 'text-right px-3 py-3 font-semibold w-14' },
        { label: 'Unité',       cls: 'text-left  px-3 py-3 font-semibold w-16' },
        { label: 'PU HT',       cls: 'text-right px-3 py-3 font-semibold w-24' },
        { label: 'Total HT',    cls: 'text-right px-4 py-3 font-semibold w-28' },
      ]
    : [
        { label: 'Description', cls: 'text-left  px-4 py-3 font-semibold' },
        { label: 'Qté',         cls: 'text-right px-3 py-3 font-semibold w-14' },
        { label: 'Unité',       cls: 'text-left  px-3 py-3 font-semibold w-16' },
        { label: 'PU HT',       cls: 'text-right px-3 py-3 font-semibold w-24' },
        { label: 'TVA',         cls: 'text-right px-3 py-3 font-semibold w-14' },
        { label: 'Total HT',    cls: 'text-right px-4 py-3 font-semibold w-28' },
      ]

  return (
    <div
      id="devis-document"
      className="mx-auto w-full max-w-[794px] bg-white p-10 font-sans text-[13px] text-gray-800"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b-2 border-orange-500 pb-6">
        <div>
          <Logo size="sm" className="mb-3" />
          <p className="text-[15px] font-bold text-gray-900">{artisan.name}</p>
          {artisan.address && <p className="mt-0.5 text-gray-500">{artisan.address}</p>}
          {artisan.phone   && <p className="text-gray-500">{artisan.phone}</p>}
          <p className="text-gray-500">{artisan.email}</p>
          {artisan.siret   && (
            <p className="mt-1 text-[11px] text-gray-400">SIRET : {artisan.siret}</p>
          )}
        </div>
        <div className="text-right">
          <div className="inline-block rounded-xl bg-orange-50 px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
              {factureMode ? 'Facture' : 'Devis'}
            </p>
            <p className="text-xl font-bold text-orange-600">{form.numero}</p>
          </div>
          <div className="mt-3 space-y-0.5 text-gray-500">
            <p><span className="font-medium text-gray-700">Émis le </span>{fmt(form.date)}</p>
            {factureMode && echeanceDate ? (
              <p><span className="font-medium text-gray-700">Échéance le </span>{fmt(echeanceDate)}</p>
            ) : !factureMode && form.validiteJours > 0 ? (
              <p>
                <span className="font-medium text-gray-700">Valable jusqu&apos;au </span>
                {fmtExpiry(form.date, form.validiteJours)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Parties ────────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-gray-50 p-4">
          <SectionLabel>De la part de</SectionLabel>
          <p className="font-semibold text-gray-900">{artisan.name}</p>
          {artisan.address && <p className="mt-0.5 text-gray-600">{artisan.address}</p>}
          {artisan.phone   && <p className="text-gray-600">{artisan.phone}</p>}
          <p className="text-gray-600">{artisan.email}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
          <SectionLabel>À destination de</SectionLabel>
          {hasClient ? (
            <>
              <p className="font-semibold text-gray-900">{form.client.nom || '—'}</p>
              {form.client.adresse   && <p className="mt-0.5 text-gray-600">{form.client.adresse}</p>}
              {form.client.telephone && <p className="text-gray-600">{form.client.telephone}</p>}
              {form.client.email     && <p className="text-gray-600">{form.client.email}</p>}
            </>
          ) : (
            <p className="italic text-gray-400">Client non renseigné</p>
          )}
        </div>
      </div>

      {/* ── Objet ──────────────────────────────────────────────────────────── */}
      {form.titre && (
        <div className="mt-6">
          <SectionLabel>Objet</SectionLabel>
          <p className="font-semibold text-gray-900">{form.titre}</p>
        </div>
      )}

      {/* ── Tableau prestations ─────────────────────────────────────────────── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-gray-900 text-white">
              {cols.map((h) => (
                <th key={h.label} className={h.cls}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {form.prestations.map((p, i) => {
              const totalHT = p.quantite * p.prixHT
              return (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                  {/* Description + note en italique */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.description || <span className="italic text-gray-400">Sans description</span>}
                    {p.note && (
                      <p className="mt-0.5 text-[11px] font-normal italic text-gray-500">{p.note}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-700">{p.quantite}</td>
                  <td className="px-3 py-3 text-gray-600">{p.unite}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-gray-700">{formatEuros(p.prixHT)}</td>
                  {!tvaNonApplicable && (
                    <td className="px-3 py-3 text-right text-gray-600">{p.tva} %</td>
                  )}
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                    {formatEuros(totalHT)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Totaux ─────────────────────────────────────────────────────────── */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1.5">
          <Row label="Total HT" value={formatEuros(totaux.totalHT)} />

          {tvaNonApplicable ? (
            <p className="text-[11px] italic text-gray-500">
              TVA non applicable, art. 293B du CGI
            </p>
          ) : (
            <>
              {totaux.tvaDetails.length > 0
                ? totaux.tvaDetails.map((t) => (
                    <Row key={t.taux} label={`TVA ${t.taux} %`} value={formatEuros(t.montant)} sub />
                  ))
                : <Row label="TVA" value="0,00 €" sub />
              }
            </>
          )}

          <div className="mt-2 border-t-2 border-gray-900 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">
                {tvaNonApplicable ? 'Total à payer' : 'Total TTC'}
              </span>
              <span className="text-xl font-bold text-orange-500">
                {formatEuros(tvaNonApplicable ? totaux.totalHT : totaux.totalTTC)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
        {factureMode ? (
          <>
            {conditionsPaiement && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3">
                <span className="mt-px text-blue-400">📋</span>
                <p className="text-[12px] text-blue-800">
                  <strong>Conditions de paiement : </strong>
                  {CONDITIONS_LABEL[conditionsPaiement] ?? conditionsPaiement}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3">
              <span className="mt-px text-amber-500">⚠️</span>
              <p className="text-[12px] text-amber-800">
                En cas de retard de paiement, des pénalités de 3 fois le taux d&apos;intérêt
                légal en vigueur seront appliquées, auxquelles s&apos;ajoutera une indemnité
                forfaitaire de recouvrement de <strong>40 €</strong>.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3">
            <span className="mt-px text-amber-500">⏳</span>
            <p className="text-[12px] text-amber-800">
              <strong>Ce devis est valable jusqu&apos;au {fmtExpiry(form.date, form.validiteJours)}.</strong>
              {' '}Passé ce délai, les tarifs pourront être révisés.
            </p>
          </div>
        )}

        {form.messageClient && (
          <div>
            <SectionLabel>Message</SectionLabel>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-600">
              {form.messageClient}
            </p>
          </div>
        )}

        <p className="text-[11px] text-gray-400">
          {factureMode
            ? 'Facture établie conformément aux conditions générales de vente.'
            : "Bon pour accord — Signature et mention manuscrite « Lu et approuvé » du client"}
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, sub = false }: { label: string; value: string; sub?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={sub ? 'text-[12px] text-gray-500' : 'text-[13px] font-medium text-gray-700'}>
        {label}
      </span>
      <span className={sub ? 'text-[12px] text-gray-600' : 'text-[13px] font-semibold text-gray-900'}>
        {value}
      </span>
    </div>
  )
}
