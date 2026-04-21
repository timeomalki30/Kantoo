'use client'

import { useEffect, useRef } from 'react'
import { X, Send, ArrowLeft } from 'lucide-react'
import { DevisDocument } from './DevisDocument'
import type { DevisForm, TotauxDevis } from '@/types/devis'

interface DevisPreviewModalProps {
  form:     DevisForm
  totaux:   TotauxDevis
  artisan:  { name: string; email: string; phone?: string; address?: string }
  sending:  boolean
  onClose:  () => void
  onConfirm: () => void
  factureMode?:        boolean
  echeanceDate?:       string
  conditionsPaiement?: string
  tvaNonApplicable?:   boolean
}

export function DevisPreviewModal({
  form,
  totaux,
  artisan,
  sending,
  onClose,
  onConfirm,
  factureMode = false,
  echeanceDate,
  conditionsPaiement,
  tvaNonApplicable = false,
}: DevisPreviewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const docLabel = factureMode ? 'facture' : 'devis'

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div className="flex h-full w-full flex-col bg-white lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-[860px] lg:rounded-2xl lg:shadow-2xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:rounded-t-2xl lg:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Aperçu avant envoi
            </p>
            <h2 className="text-base font-bold text-gray-900">
              {form.numero}{form.titre ? ` · ${form.titre}` : ''}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95"
            aria-label="Fermer l'aperçu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable document area ─────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-100"
        >
          <div className="mx-auto my-6 px-4 lg:px-8">
            <div className="overflow-hidden rounded-xl p-6 shadow-lg ring-1 ring-gray-200 lg:p-10">
              <DevisDocument
                form={form}
                totaux={totaux}
                artisan={artisan}
                factureMode={factureMode}
                echeanceDate={echeanceDate}
                conditionsPaiement={conditionsPaiement}
                tvaNonApplicable={tvaNonApplicable}
              />
            </div>
          </div>
        </div>

        {/* ── Footer actions ───────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 lg:rounded-b-2xl lg:px-6">
          <p className="mb-3 text-center text-xs text-gray-400 lg:text-left">
            Votre client recevra cette {docLabel} par email avec un lien pour la consulter.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Modifier */}
            <button
              onClick={onClose}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier {factureMode ? 'la facture' : 'le devis'}
            </button>

            {/* Confirmer */}
            <button
              onClick={onConfirm}
              disabled={sending}
              className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-orange-500 text-base font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Spinner />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Confirmer l&apos;envoi
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
