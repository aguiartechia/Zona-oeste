import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">
            Zona Oeste Trocas
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Piloto
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-8">
        <section className="flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Região Oeste · pt-PT
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Trocas locais, perto de ti
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Em breve: anúncios e trocas em{" "}
              <strong className="font-medium text-foreground">
                Caldas da Rainha
              </strong>
              ,{" "}
              <strong className="font-medium text-foreground">Alcobaça</strong> e{" "}
              <strong className="font-medium text-foreground">
                Torres Vedras
              </strong>
              . Esta página é o ponto de partida do scaffold ENTRY-2 — sem
              autenticação ainda.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" disabled>
              Entrar em breve
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              disabled
            >
              Ver anúncios (em breve)
            </Button>
          </div>

          <ul className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Auth:</span> magic
              link — mais tarde
            </li>
            <li>
              <span className="font-medium text-foreground">Listagens:</span>{" "}
              públicas — mais tarde
            </li>
            <li>
              <span className="font-medium text-foreground">Stack:</span> Next.js
              · Tailwind · shadcn/ui · Supabase
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Zona Oeste Trocas · ENTRY-2 Foundation
      </footer>
    </div>
  );
}
