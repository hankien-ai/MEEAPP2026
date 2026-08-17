/**
 * Supabase boundary for the frontend. Demo screens intentionally use data/demo.ts.
 * Replace the service implementations with Supabase queries when the data model is ready.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
};

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

let client: SupabaseClient | null = null;

/**
 * Lazily creates a single browser client once Supabase environment variables
 * are available. The shell intentionally stays usable without configuration.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(supabaseConfig.url, supabaseConfig.anonKey);
  return client;
}