import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { StatChip } from './stat-chip'

type Trend = 'up' | 'down' | 'flat'

interface Delta {
  value: string
  trend?: Trend
  label?: string
}

interface MetricCardProps {
  label: string
  value: string | ReactNode
  delta?: Delta
  subtext?: string
  icon?: ReactNode
  chips?: Array<{ label: string; tone?: 'neutral' | 'positive' | 'negative' | 'highlight' }>
  className?: string
}

const trendIcon: Record<Exclude<Trend, 'flat'>, ReactNode> = {
  up: <ArrowUpRight className="h-3.5 w-3.5" />,
  down: <ArrowDownRight className="h-3.5 w-3.5" />,
}

export function MetricCard({
  label,
  value,
  delta,
  subtext,
  icon,
  chips,
  className,
}: MetricCardProps) {
  const trend = delta?.trend && delta.trend !== 'flat' ? delta.trend : undefined

  return (
    <section
      className={cn(
        'flex h-full flex-col justify-between rounded-[1.75rem] border border-white/80 bg-white/95 p-6 text-neutral-900 shadow-[0_30px_65px_rgba(87,63,186,0.12)] backdrop-blur-xl',
        'transition-transform duration-300 ease-out hover:-translate-y-1 focus-within:-translate-y-1',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{label}</p>
          <div className="mt-3 flex items-end gap-3">
            <div className="font-display text-3xl font-semibold tracking-tight text-neutral-900">{value}</div>
            {trend && delta?.value && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold',
                  trend === 'up'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700',
                )}
              >
                {trendIcon[trend]}
                {delta.value}
              </div>
            )}
          </div>
          {subtext && <p className="mt-2 text-sm text-neutral-500">{subtext}</p>}
        </div>
        {icon && (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100/80 bg-brand-50 text-brand-700">
            {icon}
          </div>
        )}
      </div>

      {(chips?.length || delta?.label) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {delta?.label && (
            <StatChip
              label={delta.label}
              tone={trend === 'down' ? 'negative' : trend === 'up' ? 'positive' : 'neutral'}
            />
          )}
          {chips?.map((chip) => (
            <StatChip key={chip.label} label={chip.label} tone={chip.tone ?? 'neutral'} />
          ))}
        </div>
      )}
    </section>
  )
}

export default MetricCard
