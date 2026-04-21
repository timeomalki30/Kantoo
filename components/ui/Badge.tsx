import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

export type DevisStatus =
  | 'brouillon'
  | 'en_attente'
  | 'accepte'
  | 'refuse'
  | 'paye'
  | 'envoyee'
  | 'en_retard'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: DevisStatus
  variant?: 'default' | 'outline'
  dot?: boolean
}

const statusConfig: Record<DevisStatus, { label: string; classes: string; dot: string }> = {
  brouillon: {
    label:   'Brouillon',
    classes: 'bg-gray-100 text-gray-600',
    dot:     'bg-gray-400',
  },
  en_attente: {
    label:   'En attente',
    classes: 'bg-amber-50 text-amber-700',
    dot:     'bg-amber-500',
  },
  accepte: {
    label:   'Accepté',
    classes: 'bg-green-50 text-green-700',
    dot:     'bg-green-500',
  },
  refuse: {
    label:   'Refusé',
    classes: 'bg-red-50 text-red-600',
    dot:     'bg-red-500',
  },
  paye: {
    label:   'Payé',
    classes: 'bg-blue-50 text-blue-700',
    dot:     'bg-blue-500',
  },
  envoyee: {
    label:   'Envoyée',
    classes: 'bg-sky-50 text-sky-700',
    dot:     'bg-sky-500',
  },
  en_retard: {
    label:   'En retard',
    classes: 'bg-rose-50 text-rose-700',
    dot:     'bg-rose-500',
  },
}

export function Badge({
  className,
  status,
  dot = true,
  children,
  ...props
}: BadgeProps) {
  const config = status ? statusConfig[status] : null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config?.classes ?? 'bg-gray-100 text-gray-600',
        className
      )}
      {...props}
    >
      {dot && config && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)}
          aria-hidden
        />
      )}
      {children ?? config?.label}
    </span>
  )
}
