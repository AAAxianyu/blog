import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSession,
  hasValidOrigin,
  isAdminConfigured,
  isAdminRequest,
  verifyAdminPassword,
} from '@/lib/auth';

interface AttemptState {
  failures: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptState>();
const MAX_FAILURES = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function clientAddress(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: isAdminRequest(request),
    configured: isAdminConfigured(),
  });
}

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: '请求来源校验失败' }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: '后台尚未配置，请设置服务器环境变量' }, { status: 503 });
  }

  const address = clientAddress(request);
  const state = attempts.get(address);
  if (state && state.lockedUntil > Date.now()) {
    return NextResponse.json({ error: '尝试次数过多，请 15 分钟后再试' }, { status: 429 });
  }

  let password = '';
  try {
    const body = await request.json() as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    const failures = (state?.failures || 0) + 1;
    attempts.set(address, {
      failures: failures >= MAX_FAILURES ? 0 : failures,
      lockedUntil: failures >= MAX_FAILURES ? Date.now() + LOCK_DURATION_MS : 0,
    });
    return NextResponse.json({ error: '密码不正确' }, { status: 401 });
  }

  attempts.delete(address);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), adminCookieOptions);
  return response;
}

export function DELETE(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: '请求来源校验失败' }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return response;
}
