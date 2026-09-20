/**
 * Domain layer — pure business rules and types.
 * Must NOT import Next.js, React, or Supabase.
 */
export function identity<T>(value: T): T {
  return value;
}

export {
  allowlistRedirect,
  isProfileComplete,
  toPublicProfile,
  validateDisplayName,
  validateEmail,
  type ProfileCompletenessInput,
  type PublicProfileFields,
} from "./profile";
