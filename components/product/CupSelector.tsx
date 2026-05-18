'use client';

export default function CupSelector({ cups = [], selectedCup, onSelect, availableCups = [], error }: { cups?: string[]; selectedCup?: string; onSelect: (cup: string) => void; availableCups?: string[]; error?: string }) {
  if (!cups.length) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2"><span className="text-sm font-medium">کاپ:</span>{selectedCup && <span className="text-sm text-muted-foreground">{selectedCup}</span>}</div>
      <div className="flex flex-wrap gap-2">
        {cups.map((cup) => {
          const isAvailable = availableCups.length === 0 || availableCups.includes(cup);
          const isSelected = selectedCup === cup;
          return <button key={cup} type="button" onClick={() => isAvailable && onSelect(cup)} disabled={!isAvailable} className={`relative min-h-11 min-w-11 rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary ${isSelected ? 'border-foreground bg-foreground text-background' : isAvailable ? 'border-border bg-background text-foreground hover:border-foreground' : 'cursor-not-allowed border-border/50 bg-secondary text-muted-foreground opacity-50'}`} aria-label={`کاپ ${cup}${!isAvailable ? '، ناموجود' : ''}`}>{cup}{!isAvailable && <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-muted-foreground" />}</button>;
        })}
      </div>
      {error && <p className="text-xs font-medium text-destructive" role="alert" aria-live="polite">{error}</p>}
    </div>
  );
}
