/**
 * Application layer — use-cases / orchestration.
 * Depends on domain; may call infrastructure / Supabase from actions.
 */
export {
  MAGIC_LINK_COOKIE,
  MAGIC_LINK_COOLDOWN_SECONDS,
  cooldownRemainingSeconds,
  genericMagicLinkSuccessMessage,
  parseMagicLinkEmail,
  resolveAuthRedirect,
  type SendMagicLinkInput,
  type SendMagicLinkResult,
} from "./auth";

export {
  parseOnboardingInput,
  parseProfileUpdate,
  profileIsComplete,
  serializePublicProfile,
  type OnboardingInput,
  type OnboardingParsed,
  type ProfileUpdateInput,
} from "./profile";
