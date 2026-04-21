'use client'

import { useState } from 'react'
import { X, XCircle } from 'lucide-react'

interface RefusalModalProps {
  onClose:   () => void
  onConfirm: (reason: string) => void
}

const QUICK_REASONS = [
  'Budget trop élevé',
  'Délais non adaptés',
  'J\'ai choisi un autre prestataire',
  'Le projet est annulé',
]

export function RefusalModal({ onClose, onConfirm }: RefusalModalProps) {
  const [reason, setReason]       = useState('')
  const [confirming, setConf]     = useState(false)

  async function handleConfirm() {
    setConf(true)
    await new Promise((r) => setTimeout(r, 700))
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6">
      <div className="flex h-full w-full flex-col bg-white lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-[480px] lg:rounded-2xl lg:shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Refuser le devis</p>
              <p className="text-xs text-gray-400">Optionnel — aidez l&apos;artisan à s&apos;améliorer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 text-sm text-gray-600">
            Pourquoi refusez-vous ce devis ?
          </p>

          {/* Quick reasons */}
          <div className="mb-4 flex flex-wrap gap-2">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  reason === r
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Free text */}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ou précisez en quelques mots… (optionnel)"
            rows={4}
            className="block w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 space-y-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-base font-bold text-white shadow-md shadow-red-100 transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-60"
          >
            {confirming ? <Spinner /> : <XCircle className="h-5 w-5" />}
            Confirmer le refus
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
