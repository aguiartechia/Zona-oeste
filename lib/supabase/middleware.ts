import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";
import { isProfileComplete } from "@/domain/profile";

const PUBLIC_PREFIXES = ["/", "/entrar", "/auth/callback"] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/entrar" || pathname.startsWith("/entrar/")) return true;
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname === "/perfil" ||
    pathname.startsWith("/perfil/")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const env = getSupabaseEnv();
  if (!env) {
    // Without credentials, skip session refresh (build / local without Supabase).
    if (isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isProtectedPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isProtectedPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, municipality_id, onboarding_completed_at, deleted_at")
      .eq("id", user.id)
      .maybeSingle();

    const complete = isProfileComplete(profile);

    if (!complete && (pathname === "/perfil" || pathname.startsWith("/perfil/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (complete && (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/perfil";
      return NextResponse.redirect(url);
    }
  }

  // Incomplete users may still visit public paths (/, /entrar, /auth/*).
  void PUBLIC_PREFIXES;
  void isPublicPath;

  return supabaseResponse;
}
