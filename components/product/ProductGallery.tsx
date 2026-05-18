'use client';

import { useEffect, useState } from 'react';
import { imageAlt, imageUrl, type ProductImage } from './product-utils';

export default function ProductGallery({ images = [], isLoading = false, title = 'تصویر محصول' }: { images?: ProductImage[] | string[]; isLoading?: boolean; title?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => setActiveIndex(0), [images]);

  if (isLoading) {
    return <div className="space-y-3"><div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-secondary" /><div className="flex justify-center gap-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 w-16 animate-pulse rounded-md bg-secondary" />)}</div></div>;
  }
  if (!images.length) {
    return <div className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-lg bg-secondary text-muted-foreground"><span className="mb-2 text-4xl opacity-40">□</span><span className="text-sm">بدون تصویر</span></div>;
  }

  const currentImage = images[activeIndex] || images[0];
  const currentUrl = imageUrl(currentImage);
  const goNext = () => setActiveIndex((value) => (value + 1) % images.length);
  const goPrev = () => setActiveIndex((value) => (value - 1 + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary/30">
        {currentUrl ? <img src={currentUrl} alt={imageAlt(currentImage, title)} className="h-full w-full object-cover transition-transform duration-500" /> : <div className="flex h-full items-center justify-center text-muted-foreground">بدون تصویر</div>}
        {images.length > 1 && <><button type="button" onClick={goPrev} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 shadow-sm transition hover:bg-background group-hover:opacity-100" aria-label="تصویر قبلی">›</button><button type="button" onClick={goNext} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 opacity-0 shadow-sm transition hover:bg-background group-hover:opacity-100" aria-label="تصویر بعدی">‹</button></>}
        {images.length > 1 && <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">{images.map((_, index) => <button key={index} type="button" onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-4 bg-primary' : 'w-2 bg-background/60'}`} aria-label={`تصویر ${index + 1}`} />)}</div>}
      </div>
      {images.length > 1 && <div className="hidden justify-center gap-2 overflow-x-auto pb-1 md:flex">{images.map((image, index) => <button key={imageUrl(image) + index} type="button" onClick={() => setActiveIndex(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${index === activeIndex ? 'border-primary' : 'border-transparent hover:border-border'}`}><img src={imageUrl(image)} alt={imageAlt(image, `تصویر ${index + 1}`)} className="h-full w-full object-cover" /></button>)}</div>}
    </div>
  );
}
