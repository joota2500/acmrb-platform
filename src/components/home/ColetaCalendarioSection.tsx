"use client";

/**
 * ColetaCalendarioSection — "Coleta seletiva no seu bairro" (home, id="coleta")
 * ------------------------------------------------------------
 * Esquerda: chamada + botão "Agende sua coleta" (/agendar-coleta).
 * Direita: calendário por bairro (CalendarioBairros, modo compacto).
 * CSS: src/styles/coleta-section.css (prefixo "colsec").
 */

import Link from "next/link";
import { ArrowRight, CalendarDays, Truck } from "lucide-react";
import "@/styles/coleta-section.css";
import CalendarioBairros from "@/components/calendario/CalendarioBairros";

export default function ColetaCalendarioSection() {
  return (
    <section id="coleta" className="colsec" aria-labelledby="colsec-titulo">
      <div className="colsec__container">
        <div className="colsec__texto">
          <span className="colsec__selo"><Truck size={15} aria-hidden="true" /> Coleta seletiva</span>
          <h2 id="colsec-titulo" className="colsec__titulo">
            Separe, agende e <span>a ACMRB busca</span>
          </h2>
          <p className="colsec__descricao">
            Veja os dias de coleta do seu bairro ou peça uma coleta no seu endereço. Você acompanha o pedido e conversa com a equipe pelo site.
          </p>
          <div className="colsec__acoes">
            <Link href="/agendar-coleta" className="colsec__btn colsec__btn--cheio">
              Agende sua coleta <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/calendario-coleta" className="colsec__btn">
              <CalendarDays size={17} aria-hidden="true" /> Calendário completo
            </Link>
          </div>
        </div>
        <div className="colsec__painel">
          <CalendarioBairros compacto />
        </div>
      </div>
    </section>
  );
}
