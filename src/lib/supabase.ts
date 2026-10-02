// ============================================================
// Supabase Client — connects to your Supabase project
// Handles missing credentials gracefully during build time
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // During build time, env vars may not be available yet.
  // Create a dummy client that won't crash the build.
  console.warn(
    '⚠️  Supabase credentials not found or invalid. Database calls will return empty results.'
  );
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
