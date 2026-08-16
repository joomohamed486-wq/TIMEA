import { createClient } from '@supabase/supabase-js';

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`TIMEA_CONFIG_ERROR: Missing environment variable ${name}`);
  return value;
}

/** Server-only Supabase client. Never import this file into a Client Component. */
export function createSupabaseAdminClient() {
  return createClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
