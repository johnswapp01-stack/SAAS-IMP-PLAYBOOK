import { createClient } from '@supabase/supabase-js';

export type HealthStatus = 'ok' | 'degraded';

export interface HealthCheck {
  ok: boolean;
  detail?: string;
  ms?: number;
}

export interface HealthSnapshot {
  status: HealthStatus;
  service: string;
  time: string;
  checks: Record<string, HealthCheck>;
  latencyMs: number;
}

/**
 * Shared snapshot for `/api/health` and the public `/status` page.
 * Never includes secret values.
 */
export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const started = performance.now();
  const checks: Record<string, HealthCheck> = {};

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  checks.env_supabase_url = { ok: !!url };
  checks.env_supabase_anon = { ok: !!anon };
  checks.env_anthropic = { ok: !!process.env.ANTHROPIC_API_KEY };
  checks.env_openai = { ok: !!process.env.OPENAI_API_KEY };
  checks.env_stripe = { ok: !!process.env.STRIPE_SECRET_KEY };

  if (url && anon) {
    const t0 = performance.now();
    try {
      const sb = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await sb.from('agent_definitions').select('id').limit(1);
      const ms = Math.round(performance.now() - t0);
      checks.database = {
        ok: !error,
        ms,
        detail: error?.message,
      };
    } catch (e) {
      const ms = Math.round(performance.now() - t0);
      checks.database = {
        ok: false,
        ms,
        detail: e instanceof Error ? e.message : 'unknown',
      };
    }
  } else {
    checks.database = { ok: false, detail: 'Supabase URL or anon key missing' };
  }

  const anyCriticalFail =
    !checks.env_supabase_url.ok || !checks.env_supabase_anon.ok || !checks.database.ok;
  const status: HealthStatus = anyCriticalFail ? 'degraded' : 'ok';

  return {
    status,
    service: 'implementation-pro',
    time: new Date().toISOString(),
    checks,
    latencyMs: Math.round(performance.now() - started),
  };
}
