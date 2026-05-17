import type { ReactNode } from 'react';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'پنل مدیریت نوشه پوش'
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
