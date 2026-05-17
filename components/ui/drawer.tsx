'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type DrawerContextValue = { open: boolean; setOpen: (open: boolean) => void };
const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function Drawer({ open, defaultOpen = false, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; shouldScaleBackground?: boolean }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const setOpen = React.useCallback((nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange]);
  return <DrawerContext.Provider value={{ open: isOpen, setOpen }}>{children}</DrawerContext.Provider>;
}
Drawer.displayName = 'Drawer';

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error('Drawer components must be used within <Drawer>');
  return context;
}

function DrawerTrigger({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) {
  const { setOpen } = useDrawer();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(true) });
  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

function DrawerClose({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) {
  const { setOpen } = useDrawer();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(false) });
  return <button type="button" onClick={() => setOpen(false)}>{children}</button>;
}

function DrawerPortal({ children }: { children: React.ReactNode }) { return <>{children}</>; }

const DrawerOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { setOpen } = useDrawer();
  return <div ref={ref} className={cn('ui-drawer-overlay', className)} onMouseDown={() => setOpen(false)} {...props} />;
});
DrawerOverlay.displayName = 'DrawerOverlay';

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const { open } = useDrawer();
  if (!open) return null;
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div ref={ref} className={cn('ui-drawer-content', className)} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} {...props}>
        <div className="ui-drawer-handle" />
        {children}
      </div>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('ui-drawer-header', className)} {...props} />; }
function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('ui-drawer-footer', className)} {...props} />; }
const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h2 ref={ref} className={cn('ui-drawer-title', className)} {...props} />);
DrawerTitle.displayName = 'DrawerTitle';
const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <p ref={ref} className={cn('ui-drawer-description', className)} {...props} />);
DrawerDescription.displayName = 'DrawerDescription';

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
