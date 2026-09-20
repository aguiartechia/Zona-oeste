import Link from "next/link";
import { EntrarForm } from "./entrar-form";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EntrarPage({ searchParams }: Props) {
  const params = await searchParams;
  const authError = params.error === "auth";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Zona Oeste Trocas
          </Link>
          <span className="text-xs text-muted-foreground">Entrar</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Recebes um link mágico no email — sem palavra-passe.
          </p>
        </div>

        <EntrarForm authError={authError} />
      </main>
    </div>
  );
}
