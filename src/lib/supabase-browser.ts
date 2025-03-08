'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseBrowserClient;
} 