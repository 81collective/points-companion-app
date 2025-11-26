import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const accentMap = {
  sky: 'from-brand-200/80 via-brand-100/80 to-transparent border-brand-100/80',
  rose: 'from-rose-200/70 via-rose-100/70 to-transparent border-rose-100/80',
  mint: 'from-emerald-200/70 via-emerald-100/70 to-transparent border-emerald-100/80',
  amber: 'from-amber-200/70 via-amber-100/70 to-transparent border-amber-100/80',
}

type FeatureAccent = keyof typeof accentMap

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  accent?: FeatureAccent
  stat?: ReactNode
  badge?: ReactNode
  className?: string
  footer?: ReactNode
}

export function FeatureCard({
  title,
  description,
  icon,
  accent = 'sky',
  stat,
  badge,
  footer,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[1.85rem] border border-white/80 bg-white p-6 text-neutral-900 shadow-[0_30px_70px_rgba(88,59,187,0.12)] backdrop-blur-xl',
        'transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_40px_90px_rgba(74,38,168,0.18)]',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-[1px] rounded-[calc(theme(borderRadius.3xl)-2px)] border bg-gradient-to-br opacity-80 blur-3xl',
          accentMap[accent],
        )}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100/80 bg-brand-50 text-brand-700">
              {icon}
            </div>
            <div>
              {badge && <div className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{badge}</div>}
              <h3 className="font-display text-xl font-semibold tracking-tight text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-600">{description}</p>
            </div>
          </div>
          {stat && <div className="text-right text-neutral-600">{stat}</div>}
        </div>

        {footer && (
          <div className="flex items-center justify-between border-t border-neutral-100 pt-4 text-sm text-neutral-500">
            {footer}
          </div>
        )}
      </div>
    </article>
  )
}

export default FeatureCard
