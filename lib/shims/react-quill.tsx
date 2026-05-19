import React from 'react';
export default function ReactQuill({ value, onChange, placeholder }: any) { return <textarea value={value || ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className='w-full min-h-[300px] p-3'/>; }
