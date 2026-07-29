import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { deleteComment } from '@/lib/comments';

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!await deleteComment(id)) {
    return NextResponse.json({ error: '评论不存在或已经删除' }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
