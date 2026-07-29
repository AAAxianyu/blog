import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { hasValidOrigin, isAdminRequest } from './auth';

export function requireAdmin(request: NextRequest, mutation = false): NextResponse | null {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 });
  }
  if (mutation && !hasValidOrigin(request)) {
    return NextResponse.json({ error: '请求来源校验失败' }, { status: 403 });
  }
  return null;
}

export function revalidateBlogContent(): void {
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/archive');
  revalidatePath('/posts/[slug]', 'page');
  revalidatePath('/categories/[category]', 'page');
  revalidatePath('/tags/[tag]', 'page');
  revalidatePath('/search');
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
}

export function apiError(error: unknown, fallback = '操作失败'): NextResponse {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 400 });
}
