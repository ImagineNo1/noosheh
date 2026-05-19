import { cn } from '@/lib/utils';

export default function SeoScoreBadge({ score, size = 'md' }: { score?: number; size?: 'sm' | 'md' | 'lg' }) {
  const safe = Number.isFinite(score) ? Number(score) : 0;
  const color = safe >= 80 ? 'text-green-600 bg-green-50 border-green-200' : safe >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-red-600 bg-red-50 border-red-200';
  const ring = safe >= 80 ? 'stroke-green-500' : safe >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';
  const r = 16;
  const circ = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, safe)) / 100) * circ;
  const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-base' } as const;

  return <div className={cn('relative flex items-center justify-center rounded-full border font-bold', color, sizes[size])}>
    <svg className='absolute inset-0 w-full h-full -rotate-90' viewBox='0 0 40 40'>
      <circle cx='20' cy='20' r={r} fill='none' stroke='currentColor' strokeOpacity='0.15' strokeWidth='3' />
      <circle cx='20' cy='20' r={r} fill='none' className={ring} strokeWidth='3' strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap='round' />
    </svg>
    <span className='relative z-10'>{score ?? '—'}</span>
  </div>;
}
