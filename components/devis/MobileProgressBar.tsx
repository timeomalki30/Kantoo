'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const DEFAULT_STEPS = ['Chantier', 'Client', 'Prestations']

interface MobileProgressBarProps {
  currentStep: number
  steps?: string[]
}

export function MobileProgressBar({ currentStep, steps = DEFAULT_STEPS }: MobileProgressBarProps) {
  return (
    <div className="px-4 pb-4 pt-3">
      {/* Track */}
      <div className="flex items-center">
        {steps.map((label, i) => {
          const done   = i < currentStep
          const active = i === currentStep

          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              {/* Dot */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                    done   && 'bg-green-500 text-white',
                    active && 'bg-orange-500 text-white shadow-md shadow-orange-200 ring-4 ring-orange-100',
                    !done && !active && 'bg-gray-100 text-gray-400'
                  )}
                >
                  {done ? <Check className="h-4 w-4 stroke-[3]" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold whitespace-nowrap',
                    active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="mx-1 mb-5 h-0.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i < currentStep ? '#22C55E' : '#E5E7EB' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
