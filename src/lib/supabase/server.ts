import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client using the service role key.
 * Use for all server-side operations (token management, cache, purchases).
 * Bypasses RLS — only use in API routes, never expose to client.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

/**
 * Creates a Supabase client using the anon key.
 * Use for read-only or public operations where RLS applies.
 */
export function createAnonClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY")
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
