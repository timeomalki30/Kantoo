'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: React.ReactNode
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-orange-500 text-white shadow-sm hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-orange-500/30',
  secondary:
    'border border-gray-200 bg-white text-kantoo-text shadow-sm hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-300/40',
  ghost:
    'text-kantoo-text hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-300/40',
  danger:
    'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500/30',
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:   'h-8  gap-1.5 rounded-lg   px-3   text-xs  font-semibold',
  md:   'h-10 gap-2   rounded-xl   px-4   text-sm  font-semibold',
  lg:   'h-12 gap-2.5 rounded-xl   px-6   text-base font-semibold',
  icon: 'h-10 w-10   rounded-xl   justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, disabled, icon, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  )
)

Button.displayName = 'Button'

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
