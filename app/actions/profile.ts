"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseOnboardingInput, parseProfileUpdate } from "@/application/profile";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { logEvent } from "@/lib/observability";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function completeOnboardingAction(
  _prev: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  if (!getSupabaseEnv()) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const parsed = parseOnboardingInput({
    display_name: formData.get("display_name"),
    municipality_id: formData.get("municipality_id"),
    bio: formData.get("bio"),
    parish: formData.get("parish"),
  });
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entra novamente." };

  const now = new Date().toISOString();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: parsed.value.display_name,
      municipality_id: parsed.value.municipality_id,
      bio: parsed.value.bio,
      parish: parsed.value.parish,
      onboarding_completed_at: now,
      deleted_at: null,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("completeOnboarding:", error.message);
    return { ok: false, error: "Não foi possível guardar o perfil." };
  }

  logEvent("profile.created", { municipality_id: parsed.value.municipality_id });
  logEvent("onboarding.completed");

  revalidatePath("/perfil");
  revalidatePath("/onboarding");
  redirect("/perfil");
}

export async function updateProfileAction(
  _prev: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  if (!getSupabaseEnv()) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const parsed = parseProfileUpdate({
    display_name: formData.get("display_name"),
    municipality_id: formData.get("municipality_id"),
    bio: formData.get("bio"),
    parish: formData.get("parish"),
    locality: formData.get("locality"),
  });
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entra novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.value.display_name,
      municipality_id: parsed.value.municipality_id,
      bio: parsed.value.bio,
      parish: parsed.value.parish,
      locality: parsed.value.locality,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile:", error.message);
    return { ok: false, error: "Não foi possível actualizar o perfil." };
  }

  logEvent("profile.updated");
  revalidatePath("/perfil");
  return { ok: true };
}
