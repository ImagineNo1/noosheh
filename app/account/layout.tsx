import type { ReactNode } from 'react';
import AccountShell from '@/components/account/AccountShell';

export const metadata = {
  robots: { index: false, follow: false }
};

export default function Layout({ children }: { children: ReactNode }) { return <AccountShell>{children}</AccountShell>; }
