'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('admin-btn', className)} {...props} />;
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={cn('admin-card', className)}>{children}</section>;
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('admin-input', className)} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('admin-input admin-textarea', className)} {...props} />;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="admin-label">{children}</label>;
}

export function EmptyState({ icon, text, children }: { icon: string; text: string; children?: ReactNode }) {
  return (
    <Card>
      <div className="admin-empty">
        <div className="admin-empty-icon">{icon}</div>
        <p>{text}</p>
        {children}
      </div>
    </Card>
  );
}

export function Dialog({ open, title, children, onClose, wide = false }: { open: boolean; title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div className={cn('admin-dialog', wide && 'wide')} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} dir="rtl">
        <div className="admin-dialog-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="بستن">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Alert({ variant = 'default', children }: { variant?: 'default' | 'destructive'; children: ReactNode }) {
  return <div role="alert" className={cn('admin-alert', variant === 'destructive' && 'destructive')}>{children}</div>;
}

export function AlertTitle({ children }: { children: ReactNode }) {
  return <strong className="admin-alert-title">{children}</strong>;
}

export function AlertDescription({ children }: { children: ReactNode }) {
  return <div className="admin-alert-description">{children}</div>;
}

export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return <span className={cn('admin-badge', className)}>{children}</span>;
}

export function AlertDialog({ open, title, description, confirmText = 'تایید', cancelText = 'انصراف', danger = false, loading = false, onConfirm, onClose }: { open: boolean; title: string; description: ReactNode; confirmText?: string; cancelText?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="admin-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-alert-dialog-title" onMouseDown={(event) => event.stopPropagation()} dir="rtl">
        <div className="admin-alert-dialog-icon" aria-hidden="true">!</div>
        <h2 id="admin-alert-dialog-title">{title}</h2>
        <div className="admin-alert-dialog-description">{description}</div>
        <div className="admin-dialog-footer">
          <Button className="outline" onClick={onClose} disabled={loading}>{cancelText}</Button>
          <Button className={cn(danger ? 'primary danger-fill' : 'primary')} onClick={onConfirm} disabled={loading}>{loading ? 'در حال انجام...' : confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className={cn('admin-toggle', checked && 'checked')} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span />
    </button>
  );
}

export function Select({ value, onChange, children }: { value?: string; onChange: (value: string) => void; children: ReactNode }) {
  return <select className="admin-input" value={value || ''} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}
