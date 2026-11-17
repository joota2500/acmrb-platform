"use client";

/**
 * ColetaCalendarioSection — "Coleta seletiva no seu bairro" (home, id="coleta")
 * ------------------------------------------------------------
 * Esquerda: chamada + botão "Agende sua coleta" (/agendar-coleta).
 * Direita: calendário por bairro (CalendarioBairros, modo compacto).
 * Visual: Tailwind + Button.
 */

import { ArrowRight, CalendarDays, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";

export default function ColetaCalendarioSection() {
  return (
    <section
      id="coleta"
      className="scroll-mt-20 bg-linear-to-b from-[#f0fdf4] to-white py-16 max-lg:py-12 max-[480px]:py-9"
      aria-labelledby="colsec-titulo"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-2 max-lg:gap-7">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint px-3.5 py-1.5 text-[0.8rem] font-extrabold text-brand">
            <Truck size={15} aria-hidden="true" /> Coleta seletiva
          </span>
          <h2 id="colsec-titulo" className="mt-3.5 text-left text-[2rem] font-black leading-tight text-ink max-lg:text-[1.7rem] max-[480px]:text-[1.4rem]">
            Separe, agende e <span className="text-emerald-600">a ACMRB busca</span>
          </h2>
          <p className="texto-justo mt-3.5 text-[1.02rem] leading-relaxed text-ink-soft max-[480px]:text-[0.92rem]">
            Veja os dias de coleta do seu bairro ou peça uma coleta no seu endereço. Você acompanha o pedido e conversa com a equipe pelo site.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 max-[480px]:flex-col">
            <Button href="/agendar-coleta" className="h-12 rounded-[0.95rem] px-5 font-extrabold">
              Agende sua coleta <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <Button href="/calendario-coleta" variante="contorno" className="h-12 rounded-[0.95rem] px-5 font-extrabold">
              <CalendarDays size={17} aria-hidden="true" /> Calendário completo
            </Button>
          </div>
        </div>
        <div className="min-w-0 rounded-3xl border border-emerald-100 bg-white/85 p-5.5 shadow-[0_18px_40px_-24px_rgb(46_94_78/0.45)] max-[480px]:rounded-[1.15rem] max-[480px]:p-4">
          <CalendarioBairros compacto />
        </div>
      </Container>
    </section>
  );
}
