'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type DropdownContextValue = { open: boolean; setOpen: (open: boolean) => void };
const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}
function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return context;
}
function DropdownMenuTrigger({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) {
  const { open, setOpen } = useDropdown();
  if (asChild) return React.cloneElement(children, { onClick: () => setOpen(!open), 'aria-expanded': open });
  return <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>{children}</button>;
}
const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }>(({ className, sideOffset: _sideOffset, ...props }, ref) => {
  const { open } = useDropdown();
  if (!open) return null;
  return <div ref={ref} className={cn('ui-dropdown-content', className)} role="menu" {...props} />;
});
DropdownMenuContent.displayName = 'DropdownMenuContent';
const DropdownMenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (
  <button ref={ref} type="button" className={cn('ui-dropdown-item', inset && 'inset', className)} role="menuitem" {...props} />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';
function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) { return <div className={cn('ui-dropdown-label', inset && 'inset', className)} {...props} />; }
function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('ui-dropdown-separator', className)} role="separator" {...props} />; }
function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) { return <span className={cn('ui-dropdown-shortcut', className)} {...props} />; }
const passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuGroup = passthrough;
const DropdownMenuPortal = passthrough;
const DropdownMenuSub = passthrough;
const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuSubTrigger = DropdownMenuItem;
const DropdownMenuCheckboxItem = DropdownMenuItem;
const DropdownMenuRadioItem = DropdownMenuItem;
const DropdownMenuRadioGroup = passthrough;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup };
