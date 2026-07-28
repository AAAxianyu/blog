import type { Metadata } from 'next';
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/auth';
import AdminStudio from '@/components/admin/AdminStudio';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '写作后台',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  return (
    <AdminStudio
      initialAuthenticated={await isAdminAuthenticated()}
      configured={isAdminConfigured()}
    />
  );
}
