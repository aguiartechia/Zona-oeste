import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { OnboardingForm, type MunicipalityOption } from "./onboarding-form";

const FALLBACK_MUNICIPALITIES: MunicipalityOption[] = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Caldas da Rainha", slug: "caldas-da-rainha" },
  { id: "00000000-0000-4000-8000-000000000002", name: "Alcobaça", slug: "alcobaca" },
  { id: "00000000-0000-4000-8000-000000000003", name: "Torres Vedras", slug: "torres-vedras" },
];

export default async function OnboardingPage() {
  let municipalities: MunicipalityOption[] = FALLBACK_MUNICIPALITIES;

  if (getSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/entrar?next=/onboarding");
    }

    const { data } = await supabase
      .from("municipalities")
      .select("id, name, slug")
      .order("name");
    if (data && data.length > 0) {
      municipalities = data;
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Zona Oeste Trocas
          </Link>
          <span className="text-xs text-muted-foreground">Onboarding</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Completa o teu perfil</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Diz-nos como te chamas e em que município estás — necessário para
            trocas locais.
          </p>
        </div>

        <OnboardingForm municipalities={municipalities} />
      </main>
    </div>
  );
}
