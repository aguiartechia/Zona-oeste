import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { ProfileForm, type OwnProfile } from "./profile-form";
import type { MunicipalityOption } from "@/app/onboarding/onboarding-form";

export default async function PerfilPage() {
  if (!getSupabaseEnv()) {
    redirect("/entrar?next=/perfil");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/entrar?next=/perfil");
  }

  let profile: OwnProfile | null = null;

  const { data: rpcRows, error: rpcError } = await supabase.rpc("get_own_profile");
  if (!rpcError && rpcRows) {
    const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
    if (row) {
      profile = {
        display_name: row.display_name,
        municipality_id: row.municipality_id,
        bio: row.bio ?? null,
        parish: row.parish ?? null,
        locality: row.locality ?? null,
      };
    }
  }

  if (!profile) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, municipality_id, bio, parish")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      profile = {
        display_name: data.display_name,
        municipality_id: data.municipality_id,
        bio: data.bio ?? null,
        parish: data.parish ?? null,
        locality: null,
      };
    }
  }

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: municipalitiesData } = await supabase
    .from("municipalities")
    .select("id, name, slug")
    .order("name");

  const municipalities: MunicipalityOption[] = municipalitiesData ?? [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Zona Oeste Trocas
          </Link>
          <span className="text-xs text-muted-foreground">Perfil</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">O teu perfil</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Actualiza os teus dados. A localidade só é visível para ti.
          </p>
        </div>

        <ProfileForm profile={profile} municipalities={municipalities} />
      </main>
    </div>
  );
}
