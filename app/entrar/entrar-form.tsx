"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendMagicLinkAction } from "@/app/actions/auth";
import type { SendMagicLinkResult } from "@/application/auth";
import { Button } from "@/components/ui/button";

type Props = {
  authError?: boolean;
};

export function EntrarForm({ authError = false }: Props) {
  const [state, formAction, pending] = useActionState<
    SendMagicLinkResult | null,
    FormData
  >(sendMagicLinkAction, null);

  const showAuthError = authError && (!state || !state.ok);
  const showFormError = state != null && !state.ok;

  return (
    <>
      {(showAuthError || showFormError) && (
        <p
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {showFormError
            ? state.error
            : "Não foi possível concluir a autenticação. Tenta pedir um novo link."}
        </p>
      )}

      {state?.ok && (
        <p
          className="mt-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="o.teu@email.pt"
            className="h-11 rounded-lg border border-border bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            disabled={pending}
          />
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "A enviar…" : "Enviar link mágico"}
        </Button>
      </form>

      {state && !state.ok && state.cooldownSeconds != null && state.cooldownSeconds > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Podes pedir outro link dentro de {state.cooldownSeconds}s.
        </p>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          Voltar ao início
        </Link>
      </p>
    </>
  );
}
