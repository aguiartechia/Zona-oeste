/**
 * Domain — profile / auth validation (pure; no Next/React/Supabase).
 */

const DISPLAY_NAME_MIN = 2;
const DISPLAY_NAME_MAX = 80;

/** Simple email format check (not full RFC). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_REDIRECT_PREFIXES = [
  "/",
  "/perfil",
  "/onboarding",
  "/entrar",
] as const;

export type ProfileCompletenessInput = {
  display_name?: string | null;
  municipality_id?: string | null;
  onboarding_completed_at?: string | null;
  deleted_at?: string | null;
};

export function validateDisplayName(
  value: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: "Nome de apresentação inválido." };
  }
  const trimmed = value.trim();
  if (trimmed.length < DISPLAY_NAME_MIN) {
    return {
      ok: false,
      error: `O nome deve ter pelo menos ${DISPLAY_NAME_MIN} caracteres.`,
    };
  }
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return {
      ok: false,
      error: `O nome deve ter no máximo ${DISPLAY_NAME_MAX} caracteres.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function validateEmail(
  value: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: "Email inválido." };
  }
  const trimmed = value.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, error: "Indica um email válido." };
  }
  return { ok: true, value: trimmed };
}

export function isProfileComplete(profile: ProfileCompletenessInput | null | undefined): boolean {
  if (!profile) return false;
  if (profile.deleted_at) return false;
  if (!profile.onboarding_completed_at) return false;
  const name = profile.display_name?.trim() ?? "";
  if (name.length < DISPLAY_NAME_MIN) return false;
  if (!profile.municipality_id) return false;
  return true;
}

/**
 * Allowlist safe relative redirects. Rejects protocol-relative, absolute URLs, and unknown paths.
 */
export function allowlistRedirect(path: string | null | undefined): string {
  const fallback = "/";
  if (!path || typeof path !== "string") return fallback;

  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;

  const pathname = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;

  const allowed =
    pathname === "/" ||
    ALLOWED_REDIRECT_PREFIXES.some(
      (prefix) => prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
    );

  if (!allowed) return fallback;
  return trimmed;
}

/** Public profile fields — locality intentionally excluded. */
export type PublicProfileFields = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  municipality_id: string;
  parish: string | null;
  created_at: string;
};

export function toPublicProfile<T extends PublicProfileFields & { locality?: string | null }>(
  row: T,
): PublicProfileFields {
  return {
    id: row.id,
    display_name: row.display_name,
    bio: row.bio,
    avatar_url: row.avatar_url,
    municipality_id: row.municipality_id,
    parish: row.parish,
    created_at: row.created_at,
  };
}
