import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { allowlistRedirect } from "@/domain/profile";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { logEvent } from "@/lib/observability";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = allowlistRedirect(searchParams.get("next") ?? "/perfil");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    logEvent("auth.callback", { ok: false, reason: "provider_error" });
    const url = new URL("/entrar", origin);
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  if (!code) {
    logEvent("auth.callback", { ok: false, reason: "missing_code" });
    const url = new URL("/entrar", origin);
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  const env = getSupabaseEnv();
  if (!env) {
    logEvent("auth.callback", { ok: false, reason: "unconfigured" });
    const url = new URL("/entrar", origin);
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  let redirectResponse = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        redirectResponse = NextResponse.redirect(new URL(next, origin));
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logEvent("auth.callback", { ok: false, reason: "exchange_failed" });
    const url = new URL("/entrar", origin);
    url.searchParams.set("error", "auth");
    return NextResponse.redirect(url);
  }

  logEvent("auth.callback", { ok: true });
  return redirectResponse;
}
