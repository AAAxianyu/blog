import { NextResponse, type NextRequest } from 'next/server';
import { apiError, requireAdmin, revalidateBlogContent } from '@/lib/admin-api';
import { listAdminPosts, postInputSchema, saveAdminPost } from '@/lib/post-admin';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json({ posts: listAdminPosts() });
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  try {
    const input = postInputSchema.parse(await request.json());
    const post = saveAdminPost(input);
    revalidateBlogContent();
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return apiError(error, '文章保存失败');
  }
}
