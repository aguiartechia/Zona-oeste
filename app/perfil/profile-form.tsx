"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, type ProfileActionResult } from "@/app/actions/profile";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { MunicipalityOption } from "@/app/onboarding/onboarding-form";

export type OwnProfile = {
  display_name: string;
  municipality_id: string;
  bio: string | null;
  parish: string | null;
  locality: string | null;
};

type Props = {
  profile: OwnProfile;
  municipalities: MunicipalityOption[];
};

export function ProfileForm({ profile, municipalities }: Props) {
  const [state, formAction, pending] = useActionState<
    ProfileActionResult | null,
    FormData
  >(updateProfileAction, null);
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();

  function handleLogout() {
    startLogout(async () => {
      await signOutAction();
      router.push("/entrar");
      router.refresh();
    });
  }

  return (
    <>
      {state?.ok && (
        <p
          className="mt-4 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          role="status"
        >
          Perfil actualizado.
        </p>
      )}
      {state && !state.ok && (
        <p
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Nome de apresentação</span>
          <input
            type="text"
            name="display_name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={profile.display_name}
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Município</span>
          <select
            name="municipality_id"
            required
            defaultValue={profile.municipality_id}
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          >
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">
            Freguesia <span className="font-normal text-muted-foreground">(opcional)</span>
          </span>
          <input
            type="text"
            name="parish"
            maxLength={120}
            defaultValue={profile.parish ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">
            Localidade{" "}
            <span className="font-normal text-muted-foreground">
              (só tu vês — opcional)
            </span>
          </span>
          <input
            type="text"
            name="locality"
            maxLength={120}
            defaultValue={profile.locality ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">
            Bio <span className="font-normal text-muted-foreground">(opcional)</span>
          </span>
          <textarea
            name="bio"
            maxLength={500}
            rows={3}
            defaultValue={profile.bio ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "A guardar…" : "Guardar alterações"}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? "A sair…" : "Terminar sessão"}
        </Button>
      </div>
    </>
  );
}
