import React from 'react';
export function Link({ to, children, ...props }: any) { return <a href={to} {...props}>{children}</a>; }
export function useNavigate() { return (to: string) => { if (typeof window !== 'undefined') window.location.href = to; }; }
