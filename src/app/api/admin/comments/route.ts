import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { listAllComments } from '@/lib/comments';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json(
    { comments: listAllComments() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
