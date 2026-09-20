export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase não configurado. Define NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local.",
    );
  }
  return env;
}
