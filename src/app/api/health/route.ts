export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getHealthSnapshot, type HealthStatus } from '@/lib/health/snapshot';

export type { HealthStatus };

export async function GET() {
  const body = await getHealthSnapshot();
  return NextResponse.json(body, { status: body.status === 'ok' ? 200 : 503 });
}
