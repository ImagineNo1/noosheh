'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

type GuidedTourProps = {
  storageKey: string;
  steps: TourStep[];
  helpLabel?: string;
};

const buttonClass = 'rounded-full px-4 py-2 text-xs font-black transition';

export default function GuidedTour({ storageKey, steps, helpLabel = 'راهنما' }: GuidedTourProps) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const availableSteps = useMemo(() => steps.filter((step) => typeof document !== 'undefined' && document.querySelector(step.selector)), [steps, pathname, active]);
  const current = availableSteps[index] || availableSteps[0];

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === 'done';
    if (!dismissed) {
      const timer = window.setTimeout(() => setActive(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, [storageKey]);

  useEffect(() => {
    setIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (!active || !current) return;
    const update = () => {
      const element = document.querySelector(current.selector);
      if (!element) return;
      element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      window.setTimeout(() => setRect(element.getBoundingClientRect()), 260);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active, current]);

  const finish = () => {
    window.localStorage.setItem(storageKey, 'done');
    setActive(false);
    setIndex(0);
  };

  const open = () => {
    setIndex(0);
    setActive(true);
  };

  const next = () => {
    if (index >= availableSteps.length - 1) finish();
    else setIndex((value) => value + 1);
  };

  if (!active || !current || !rect) {
    return <button type="button" onClick={open} className="admin-tour-help">؟ {helpLabel}</button>;
  }

  const popoverTop = rect.bottom + 16 > window.innerHeight - 220 ? Math.max(18, rect.top - 236) : rect.bottom + 16;
  const popoverLeft = Math.min(Math.max(18, rect.left + rect.width / 2 - 180), window.innerWidth - 378);

  return (
    <>
      <div className="admin-tour-scrim" />
      <div
        className="admin-tour-spotlight"
        style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }}
      />
      <div className="admin-tour-popover" style={{ top: popoverTop, left: popoverLeft }} dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">{(index + 1).toLocaleString('fa-IR')} / {availableSteps.length.toLocaleString('fa-IR')}</span>
          <button type="button" onClick={finish} className="text-xs font-bold text-muted-foreground hover:text-destructive">بیخیال</button>
        </div>
        <h3 className="mt-4 text-lg font-black text-[#2d1b18]">{current.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#6f5a54]">{current.description}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className={`${buttonClass} border border-border text-muted-foreground disabled:opacity-40`}>قبلی</button>
          <button type="button" onClick={next} className={`${buttonClass} bg-primary text-primary-foreground shadow-lg shadow-primary/20`}>{index >= availableSteps.length - 1 ? 'تمام شد' : 'بعدی'}</button>
        </div>
      </div>
      <button type="button" onClick={open} className="admin-tour-help">؟ {helpLabel}</button>
    </>
  );
}
