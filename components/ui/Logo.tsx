import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 36, text: 'text-2xl' },
  lg: { icon: 48, text: 'text-3xl' },
}

export function Logo({ size = 'md', variant = 'full', className }: LogoProps) {
  const { icon, text } = sizes[size]

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      {/* Icon mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Rounded square background */}
        <rect width="48" height="48" rx="12" fill="#F97316" />

        {/* Stylized "K" formed by a wrench + chevron — artisan tooling */}
        {/* Vertical bar */}
        <rect x="13" y="11" width="5" height="26" rx="2.5" fill="white" />

        {/* Upper arm of K */}
        <path
          d="M18 24 L33 13"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Lower arm of K */}
        <path
          d="M18 24 L33 35"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Small dot — precision / quality */}
        <circle cx="35" cy="35" r="3" fill="white" opacity="0.6" />
      </svg>

      {variant === 'full' && (
        <span
          className={cn(
            'font-bold tracking-tight text-kantoo-dark',
            text
          )}
        >
          Kantoo
        </span>
      )}
    </div>
  )
}
