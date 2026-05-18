import type { Product } from '@/app/admin/types';

const badgeMap: Record<string, { label: string; className: string }> = {
  new: { label: 'جدید', className: 'bg-green-100 text-green-700 border-green-200' },
  sale: { label: 'فروش ویژه', className: 'bg-primary/10 text-primary border-primary/20' },
  final_sale: { label: 'حراج نهایی', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  best_seller: { label: 'پرفروش', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  limited: { label: 'محدود', className: 'bg-purple-100 text-purple-700 border-purple-200' }
};

export default function ProductBadges({ badges = [], isAvailable = true }: { badges?: Product['badges']; isAvailable?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(badges || []).map((badge) => {
        const config = badgeMap[badge];
        if (!config) return null;
        return <span key={badge} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}>{config.label}</span>;
      })}
      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isAvailable ? 'border-green-200 bg-green-50 text-green-600' : 'border-destructive/20 bg-destructive/10 text-destructive'}`}>{isAvailable ? 'موجود' : 'ناموجود'}</span>
    </div>
  );
}
