'use client';

export default function SizeSelector({ sizes = [], selectedSize, onSelect, availableSizes = [], error, sizeGuide }: { sizes?: string[]; selectedSize?: string; onSelect: (size: string) => void; availableSizes?: string[]; error?: string; sizeGuide?: string }) {
  if (!sizes.length) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-sm font-medium">سایز:</span>{selectedSize && <span className="text-sm text-muted-foreground">{selectedSize}</span>}</div>{sizeGuide && <a href="#size-guide" className="text-xs font-medium text-primary hover:underline">📏 راهنمای سایز</a>}</div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isAvailable = availableSizes.length === 0 || availableSizes.includes(size);
          const isSelected = selectedSize === size;
          return <button key={size} type="button" onClick={() => isAvailable && onSelect(size)} disabled={!isAvailable} className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary ${isSelected ? 'border-foreground bg-foreground text-background' : isAvailable ? 'border-border bg-background text-foreground hover:border-foreground' : 'cursor-not-allowed border-border/50 bg-secondary text-muted-foreground opacity-50 line-through'}`} aria-label={`سایز ${size}${!isAvailable ? '، ناموجود' : ''}`}>{size}</button>;
        })}
      </div>
      {error && <p className="text-xs font-medium text-destructive" role="alert" aria-live="polite">{error}</p>}
    </div>
  );
}
