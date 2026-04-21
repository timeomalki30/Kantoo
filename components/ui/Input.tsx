import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'

// ─── Shared label/error atoms ────────────────────────────────────────────────

function Label({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-kantoo-text">
      {children}
      {required && <span className="ml-1 text-orange-500">*</span>}
    </label>
  )
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>
}

function HintMsg({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-gray-400">{message}</p>
}

const baseInput = [
  'block w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-kantoo-text',
  'placeholder:text-gray-400',
  'shadow-sm transition-all duration-150',
  'hover:border-gray-300',
  'focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
].join(' ')

const errorInput = 'border-red-400 focus:border-red-400 focus:ring-red-500/20'

// ─── Input ───────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, required, ...props }, ref) => (
    <div>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 text-gray-400">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          className={cn(
            baseInput,
            error && errorInput,
            prefix && 'pl-9',
            suffix && 'pr-9',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      <ErrorMsg message={error} />
      <HintMsg message={hint} />
    </div>
  )
)
Input.displayName = 'Input'

// ─── Textarea ────────────────────────────────────────────────────────────────

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => (
    <div>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <textarea
        ref={ref}
        id={id}
        required={required}
        className={cn(
          baseInput,
          'min-h-[96px] resize-y leading-relaxed',
          error && errorInput,
          className
        )}
        {...props}
      />
      <ErrorMsg message={error} />
      <HintMsg message={hint} />
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Select ──────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, required, options, ...props }, ref) => (
    <div>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <select
        ref={ref}
        id={id}
        required={required}
        className={cn(
          baseInput,
          'cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")] bg-[right_12px_center] bg-no-repeat pr-9',
          error && errorInput,
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ErrorMsg message={error} />
      <HintMsg message={hint} />
    </div>
  )
)
Select.displayName = 'Select'
