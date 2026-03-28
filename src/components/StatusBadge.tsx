import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    synced: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
      styles[status as keyof typeof styles] || styles.draft
    )}>
      {status}
    </span>
  )
}
