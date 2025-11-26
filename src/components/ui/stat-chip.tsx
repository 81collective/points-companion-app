import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatChipTone = 'neutral' | 'positive' | 'negative' | 'highlight'

type StatChipSize = 'sm' | 'md'

interface StatChipProps {
  label: string
  tone?: StatChipTone
  size?: StatChipSize
  icon?: ReactNode
  className?: string
}

const toneClasses: Record<StatChipTone, string> = {
  neutral: 'bg-white/80 text-neutral-700 border-white/70 shadow-[0_5px_18px_rgba(38,8,99,0.08)]',
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_5px_18px_rgba(16,185,129,0.15)]',
  negative: 'bg-rose-50 text-rose-700 border-rose-200 shadow-[0_5px_18px_rgba(234,59,110,0.15)]',
  highlight: 'bg-brand-50 text-brand-700 border-brand-200 shadow-[0_10px_28px_rgba(87,38,185,0.2)]',
}

const sizeClasses: Record<StatChipSize, string> = {
  sm: 'text-[0.7rem] px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
}

export function StatChip({
  label,
  tone = 'neutral',
  size = 'sm',
  icon,
  className,
}: StatChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-[0.15em] uppercase transition-colors text-[0.68rem]',
        'backdrop-blur-lg',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      {icon && <span className="flex items-center text-current">{icon}</span>}
      {label}
    </span>
  )
}

export default StatChip
