'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`admin-btn ${className}`} {...props} />;
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`admin-card ${className}`}>{children}</section>;
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`admin-input ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`admin-input admin-textarea ${className}`} {...props} />;
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
      <div className={`admin-dialog ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()} dir="rtl">
        <div className="admin-dialog-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="بستن">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className={`admin-toggle ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span />
    </button>
  );
}

export function Select({ value, onChange, children }: { value?: string; onChange: (value: string) => void; children: ReactNode }) {
  return <select className="admin-input" value={value || ''} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}
