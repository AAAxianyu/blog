import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CommentModeration from '@/components/admin/CommentModeration';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '评论管理',
  robots: { index: false, follow: false },
};

export default async function AdminCommentsPage() {
  if (!await isAdminAuthenticated()) redirect('/admin');
  return <CommentModeration />;
}
