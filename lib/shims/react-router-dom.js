'use client';
import LinkNext from 'next/link';
import { useRouter } from 'next/navigation';
export const Link = ({ to, children, ...props }) => <LinkNext href={to || '#'} {...props}>{children}</LinkNext>;
export const useNavigate = () => { const r = useRouter(); return (to) => r.push(to); };
