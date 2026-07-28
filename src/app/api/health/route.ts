import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    ok: true,
    version: process.env.DEPLOYMENT_VERSION || 'development',
    uptime: Math.floor(process.uptime()),
  });
}
