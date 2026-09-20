"use client";

import { useActionState } from "react";
import { completeOnboardingAction } from "@/app/actions/profile";
import type { ProfileActionResult } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

export type MunicipalityOption = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  municipalities: MunicipalityOption[];
};

export function OnboardingForm({ municipalities }: Props) {
  const [state, formAction, pending] = useActionState<
    ProfileActionResult | null,
    FormData
  >(completeOnboardingAction, null);

  return (
    <>
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
            autoComplete="nickname"
            placeholder="Como queres aparecer"
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Município</span>
          <select
            name="municipality_id"
            required
            defaultValue=""
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          >
            <option value="" disabled>
              Selecciona…
            </option>
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
            className="rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "A guardar…" : "Concluir perfil"}
        </Button>
      </form>
    </>
  );
}
