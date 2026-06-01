'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DialogContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const setOpen = React.useCallback((nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange]);

  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>;
}

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error('Dialog components must be used within <Dialog>');
  return context;
}

function DialogTrigger({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) {
  const { setOpen } = useDialog();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(true) });
  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

function DialogClose({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) {
  const { setOpen } = useDialog();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(false) });
  return <button type="button" onClick={() => setOpen(false)}>{children}</button>;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { setOpen } = useDialog();
  return <div ref={ref} className={cn('ui-dialog-overlay', className)} onMouseDown={() => setOpen(false)} {...props} />;
});
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialog();
  if (!open) return null;
  return (
    <DialogPortal>
      <DialogOverlay />
      <div ref={ref} className={cn('ui-dialog-content', className)} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} {...props}>
        {children}
        <button type="button" className="ui-dialog-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-dialog-header', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-dialog-footer', className)} {...props} />;
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('ui-dialog-title', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('ui-dialog-description', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
