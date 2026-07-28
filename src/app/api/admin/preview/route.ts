import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { markdownToHtml } from '@/lib/markdown';

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request, true);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null) as { markdown?: unknown } | null;
  const markdown = typeof body?.markdown === 'string' ? body.markdown : '';
  if (markdown.length > 500_000) {
    return NextResponse.json({ error: '文章内容过长' }, { status: 413 });
  }

  return NextResponse.json({ html: await markdownToHtml(markdown) });
}
