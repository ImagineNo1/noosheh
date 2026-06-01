import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'پنل مدیریت نوشه پوش',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
