'use client'

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* ── Toast container ──────────────────────────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-20 left-1/2 z-[9999] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 lg:bottom-5 lg:left-auto lg:right-5 lg:translate-x-0 lg:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'flex animate-fade-in-up items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg',
              t.type === 'success' && 'border-green-200 bg-green-50 text-green-800',
              t.type === 'error'   && 'border-red-200 bg-red-50 text-red-800',
              t.type === 'info'    && 'border-blue-200 bg-blue-50 text-blue-800',
            ].filter(Boolean).join(' ')}
          >
            {t.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />}
            {t.type === 'error'   && <AlertCircle   className="mt-0.5 h-4 w-4 shrink-0 text-red-500"   />}
            {t.type === 'info'    && <Info           className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"  />}
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  return useContext(ToastContext)
}
