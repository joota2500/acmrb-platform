"use client";

/**
 * ColetaCalendarioSection — "Coleta seletiva" (âncora #coleta)
 * ------------------------------------------------------------
 * Texto + botões à esquerda e, à direita, o calendário compacto por bairro
 * (componente CalendarioBairros, que lê os dados do Supabase).
 * Responsivo: o calendário vai para baixo do texto em telas menores que 1024px.
 */

import { ArrowRight, CalendarDays, Truck } from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";

export default function ColetaCalendarioSection() {
  return (
    <section
      id="coleta"
      aria-labelledby="colsec-titulo"
      className="relative isolate overflow-hidden bg-brand-soft py-16 sm:py-20 lg:py-24"
    >
      {/* círculo decorativo */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 -z-10 size-80 rounded-full bg-leaf-bright/10" />

      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf-bright/25 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf">
            <Truck size={14} aria-hidden="true" /> Coleta seletiva
          </span>

          <h2 id="colsec-titulo" className="mt-4 text-balance text-left text-headline font-black text-ink">
            Separe, agende e <span className="text-leaf">a ACMRB busca</span>
          </h2>

          <p lang="pt-BR" className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Veja os dias de coleta do seu bairro ou peça uma coleta no seu endereço. Você acompanha o pedido e conversa
            com a equipe pelo site.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/agendar-coleta" tamanho="grande">
              Agende sua coleta <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="/calendario-coleta" variante="contorno" tamanho="grande">
              <CalendarDays size={18} aria-hidden="true" /> Calendário completo
            </Button>
          </div>
        </div>

        {/* Calendário por bairro dentro de um cartão */}
        <div className="min-w-0 rounded-3xl border border-white bg-white p-4 shadow-pop sm:p-6">
          <CalendarioBairros compacto />
        </div>
      </Container>
    </section>
  );
}
