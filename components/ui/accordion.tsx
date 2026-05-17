'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AccordionContextValue = {
  openValue: string;
  setOpenValue: (value: string) => void;
  collapsible: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<string | null>(null);

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: 'single';
  collapsible?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

function Accordion({ className, collapsible = false, defaultValue = '', value, onValueChange, children, ...props }: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const openValue = value ?? internalValue;

  const setOpenValue = React.useCallback((nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }, [onValueChange]);

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue, collapsible }}>
      <div className={cn('ui-accordion', className)} {...props}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={value}>
      <div ref={ref} className={cn('ui-accordion-item', className)} {...props}>{children}</div>
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const accordion = React.useContext(AccordionContext);
    const itemValue = React.useContext(AccordionItemContext);
    if (!accordion || itemValue === null) throw new Error('AccordionTrigger must be used inside AccordionItem');
    const open = accordion.openValue === itemValue;

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        className={cn('ui-accordion-trigger', className)}
        onClick={() => accordion.setOpenValue(open && accordion.collapsible ? '' : itemValue)}
        {...props}
      >
        <span>{children}</span>
        <span className="ui-accordion-chevron" aria-hidden="true">⌄</span>
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const accordion = React.useContext(AccordionContext);
    const itemValue = React.useContext(AccordionItemContext);
    if (!accordion || itemValue === null) throw new Error('AccordionContent must be used inside AccordionItem');
    const open = accordion.openValue === itemValue;

    return (
      <div ref={ref} data-state={open ? 'open' : 'closed'} hidden={!open} className={cn('ui-accordion-content', className)} {...props}>
        <div className="ui-accordion-content-inner">{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
