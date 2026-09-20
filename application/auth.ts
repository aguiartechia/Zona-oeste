/**
 * Application — auth use-cases (thin orchestration).
 */
import { allowlistRedirect, validateEmail } from "@/domain/profile";

export type SendMagicLinkInput = {
  email: unknown;
  redirectTo: string;
  emailRedirectTo: string;
};

export type SendMagicLinkResult =
  | { ok: true; message: string }
  | { ok: false; error: string; cooldownSeconds?: number };

export const MAGIC_LINK_COOLDOWN_SECONDS = 60;
export const MAGIC_LINK_COOKIE = "zo_magic_link_sent_at";

export function parseMagicLinkEmail(email: unknown) {
  return validateEmail(email);
}

export function resolveAuthRedirect(next: string | null | undefined): string {
  return allowlistRedirect(next ?? "/perfil");
}

export function genericMagicLinkSuccessMessage(): string {
  return "Se o email existir na nossa base, enviaremos um link de acesso em breve. Verifica a caixa de entrada e o spam.";
}

export function cooldownRemainingSeconds(
  lastSentAtMs: number | null | undefined,
  nowMs: number = Date.now(),
  cooldownSeconds: number = MAGIC_LINK_COOLDOWN_SECONDS,
): number {
  if (lastSentAtMs == null || !Number.isFinite(lastSentAtMs)) return 0;
  const elapsed = Math.floor((nowMs - lastSentAtMs) / 1000);
  const remaining = cooldownSeconds - elapsed;
  return remaining > 0 ? remaining : 0;
}
