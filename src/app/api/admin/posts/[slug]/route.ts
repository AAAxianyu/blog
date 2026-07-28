import { NextResponse, type NextRequest } from 'next/server';
import { apiError, requireAdmin, revalidateBlogContent } from '@/lib/admin-api';
import { archiveAdminPost, postInputSchema, readAdminPost, saveAdminPost } from '@/lib/post-admin';

interface Context {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const post = readAdminPost(slug);
  if (!post) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest, { params }: Context) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  try {
    const { slug } = await params;
    const input = postInputSchema.parse(await request.json());
    const post = saveAdminPost(input, slug);
    revalidateBlogContent();
    return NextResponse.json({ post });
  } catch (error) {
    return apiError(error, '文章保存失败');
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  try {
    const { slug } = await params;
    const archivedName = archiveAdminPost(slug);
    revalidateBlogContent();
    return NextResponse.json({ archived: true, archivedName });
  } catch (error) {
    return apiError(error, '文章归档失败');
  }
}
