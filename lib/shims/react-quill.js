'use client';
export default function ReactQuill({ value, onChange, className }) { return <textarea className={className} value={value || ''} onChange={(e)=>onChange?.(e.target.value)} />; }
