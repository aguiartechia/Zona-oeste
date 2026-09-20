/**
 * Application — profile use-cases (thin orchestration).
 */
import {
  isProfileComplete,
  toPublicProfile,
  validateDisplayName,
  type ProfileCompletenessInput,
  type PublicProfileFields,
} from "@/domain/profile";

export type OnboardingInput = {
  display_name: unknown;
  municipality_id: unknown;
  bio?: unknown;
  parish?: unknown;
};

export type OnboardingParsed = {
  display_name: string;
  municipality_id: string;
  bio: string | null;
  parish: string | null;
};

export function parseOnboardingInput(
  input: OnboardingInput,
): { ok: true; value: OnboardingParsed } | { ok: false; error: string } {
  const name = validateDisplayName(input.display_name);
  if (!name.ok) return name;

  if (typeof input.municipality_id !== "string" || !input.municipality_id.trim()) {
    return { ok: false, error: "Selecciona um município." };
  }

  const bio =
    typeof input.bio === "string" && input.bio.trim()
      ? input.bio.trim().slice(0, 500)
      : null;
  const parish =
    typeof input.parish === "string" && input.parish.trim()
      ? input.parish.trim().slice(0, 120)
      : null;

  return {
    ok: true,
    value: {
      display_name: name.value,
      municipality_id: input.municipality_id.trim(),
      bio,
      parish,
    },
  };
}

export type ProfileUpdateInput = {
  display_name: unknown;
  municipality_id: unknown;
  bio?: unknown;
  parish?: unknown;
  locality?: unknown;
};

export function parseProfileUpdate(
  input: ProfileUpdateInput,
):
  | {
      ok: true;
      value: OnboardingParsed & { locality: string | null };
    }
  | { ok: false; error: string } {
  const base = parseOnboardingInput(input);
  if (!base.ok) return base;

  const locality =
    typeof input.locality === "string" && input.locality.trim()
      ? input.locality.trim().slice(0, 120)
      : null;

  return {
    ok: true,
    value: { ...base.value, locality },
  };
}

export function profileIsComplete(profile: ProfileCompletenessInput | null | undefined) {
  return isProfileComplete(profile);
}

export function serializePublicProfile(
  row: PublicProfileFields & { locality?: string | null },
): PublicProfileFields {
  return toPublicProfile(row);
}
