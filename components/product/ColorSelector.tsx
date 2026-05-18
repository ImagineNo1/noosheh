'use client';

import type { ProductColor } from './product-utils';
import { colorValue } from './product-utils';

function isLightColor(hex?: string) {
  if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return true;
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function ColorSelector({ colors = [], selectedColor, onSelect }: { colors?: ProductColor[]; selectedColor?: ProductColor | null; onSelect: (color: ProductColor) => void }) {
  if (!colors.length) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2"><span className="text-sm font-medium">رنگ:</span>{selectedColor && <span className="text-sm text-muted-foreground">{selectedColor.name}</span>}</div>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const key = colorValue(color);
          const isSelected = colorValue(selectedColor) === key;
          const isAvailable = color.is_active !== false && color.active !== false;
          return (
            <button
              key={key}
              type="button"
              onClick={() => isAvailable && onSelect(color)}
              disabled={!isAvailable}
              className={`relative h-10 w-10 rounded-full border border-border transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${!isAvailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:scale-110'}`}
              style={{ backgroundColor: color.hex || color.value || '#ccc' }}
              aria-label={`رنگ: ${color.name}${!isAvailable ? '، ناموجود' : ''}`}
              title={color.name}
            >
              {isSelected && <span className={`absolute inset-0 grid place-items-center text-sm font-black ${isLightColor(color.hex) ? 'text-foreground' : 'text-white'}`}>✓</span>}
              {!isAvailable && <span className="absolute left-0 right-0 top-1/2 h-px -rotate-45 bg-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
