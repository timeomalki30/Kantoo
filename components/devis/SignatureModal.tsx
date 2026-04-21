'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, useCallback } from 'react'
import { X, RotateCcw, PenLine } from 'lucide-react'
import type SignatureCanvasType from 'react-signature-canvas'

// No SSR — canvas is DOM-only. Cast preserves the class ref type that dynamic() strips.
const SignatureCanvas = dynamic(
  () => import('react-signature-canvas'),
  { ssr: false }
) as unknown as typeof SignatureCanvasType

interface SignatureModalProps {
  onClose:    () => void
  onValidate: (signatureDataUrl: string) => void
}

export function SignatureModal({ onClose, onValidate }: SignatureModalProps) {
  const canvasRef    = useRef<SignatureCanvasType>(null)
  const [empty, setEmpty]     = useState(true)
  const [cgv, setCgv]         = useState(false)
  const [validating, setVal]  = useState(false)

  const handleEnd = useCallback(() => {
    setEmpty(canvasRef.current?.isEmpty() ?? true)
  }, [])

  function handleClear() {
    canvasRef.current?.clear()
    setEmpty(true)
  }

  async function handleValidate() {
    if (!canvasRef.current || empty || !cgv) return
    setVal(true)
    const dataUrl = canvasRef.current.getTrimmedCanvas().toDataURL('image/png')
    await new Promise((r) => setTimeout(r, 600)) // simule upload
    onValidate(dataUrl)
  }

  const canSubmit = !empty && cgv && !validating

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6">
      <div className="flex h-full w-full flex-col bg-white lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-[560px] lg:rounded-2xl lg:shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
              <PenLine className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Signature électronique</p>
              <p className="text-xs text-gray-400">Signez avec votre doigt ou la souris</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* Canvas zone */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors has-[canvas:focus]:border-green-400">
            {/* Guide text — shown only when empty */}
            {empty && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                <PenLine className="h-8 w-8" />
                <span className="text-sm font-medium">Signez ici</span>
              </div>
            )}

            <SignatureCanvas
              ref={canvasRef}
              onEnd={handleEnd}
              canvasProps={{
                className: 'w-full touch-none',
                style: { height: '200px', display: 'block' },
              }}
              backgroundColor="transparent"
              penColor="#111827"
            />
          </div>

          {/* Clear */}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              disabled={empty}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Effacer
            </button>
          </div>

          {/* CGV */}
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-green-300 hover:bg-green-50/30">
            <input
              type="checkbox"
              checked={cgv}
              onChange={(e) => setCgv(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-green-500"
            />
            <span className="text-sm leading-relaxed text-gray-700">
              J&apos;accepte les{' '}
              <span className="font-semibold text-green-600 underline decoration-dotted">
                conditions générales de vente
              </span>{' '}
              et confirme que cette signature électronique engage ma responsabilité.
            </span>
          </label>

          {/* Hint */}
          {(!empty && !cgv) && (
            <p className="mt-3 text-center text-xs text-amber-600">
              ⚠ Cochez les CGV pour finaliser
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={handleValidate}
            disabled={!canSubmit}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-green-500 text-base font-bold text-white shadow-md shadow-green-200 transition-all hover:bg-green-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {validating ? (
              <>
                <Spinner />
                Validation en cours…
              </>
            ) : (
              <>
                <PenLine className="h-5 w-5" />
                Valider ma signature
              </>
            )}
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
