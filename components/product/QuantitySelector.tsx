'use client';

export default function QuantitySelector({ value = 1, onChange, max = 99 }: { value?: number; onChange: (value: number) => void; max?: number }) {
  const safeMax = Math.max(1, max || 99);
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">تعداد</span>
      <div className="flex w-fit items-center overflow-hidden rounded-md border border-border">
        <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-30" aria-label="کاهش تعداد">−</button>
        <span className="flex h-10 w-10 items-center justify-center border-x border-border text-sm font-medium">{value.toLocaleString('fa-IR')}</span>
        <button type="button" onClick={() => onChange(Math.min(safeMax, value + 1))} disabled={value >= safeMax} className="flex h-10 w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-30" aria-label="افزایش تعداد">＋</button>
      </div>
    </div>
  );
}
