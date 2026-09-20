"use server";

import { cookies } from "next/headers";
import {
  MAGIC_LINK_COOKIE,
  MAGIC_LINK_COOLDOWN_SECONDS,
  cooldownRemainingSeconds,
  genericMagicLinkSuccessMessage,
  parseMagicLinkEmail,
  type SendMagicLinkResult,
} from "@/application/auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { logEvent } from "@/lib/observability";

export async function sendMagicLinkAction(
  _prev: SendMagicLinkResult | null,
  formData: FormData,
): Promise<SendMagicLinkResult> {
  const parsed = parseMagicLinkEmail(formData.get("email"));
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const cookieStore = await cookies();
  const lastRaw = cookieStore.get(MAGIC_LINK_COOKIE)?.value;
  const lastSentAt = lastRaw ? Number(lastRaw) : null;
  const remaining = cooldownRemainingSeconds(lastSentAt);
  if (remaining > 0) {
    return {
      ok: false,
      error: `Aguarda ${remaining}s antes de pedir outro link.`,
      cooldownSeconds: remaining,
    };
  }

  if (!getSupabaseEnv()) {
    // Still set cooldown + generic message so UI works without mailer in CI.
    cookieStore.set(MAGIC_LINK_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAGIC_LINK_COOLDOWN_SECONDS,
    });
    logEvent("auth.magic_link_requested", { configured: false });
    return { ok: true, message: genericMagicLinkSuccessMessage() };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const origin =
    siteUrl ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://127.0.0.1:3000");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.value,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  // Always generic success to avoid account enumeration; log server-side only.
  if (error) {
    console.error("signInWithOtp error:", error.message);
  }

  cookieStore.set(MAGIC_LINK_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAGIC_LINK_COOLDOWN_SECONDS,
  });

  logEvent("auth.magic_link_requested", { ok: !error });
  return { ok: true, message: genericMagicLinkSuccessMessage() };
}

export async function signOutAction(): Promise<void> {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  logEvent("auth.logout");
}
