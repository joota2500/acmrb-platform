"use client";

/** Perguntas frequentes sobre a metodologia (acordeão acessível com <details>) */

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import "@/styles/transp-faq.css";

const PERGUNTAS = [
  {
    p: "Como os pesos de materiais são obtidos?",
    r: "Cada lote de material triado é pesado na sede da associação e registrado no sistema pela equipe administrativa, com tipo de material e data. O peso total exibido é a soma direta desses registros, sem arredondamentos ou estimativas.",
  },
  {
    p: "O que é o valor operacional?",
    r: "É a soma do peso de cada registro multiplicado pelo valor por quilo informado na comercialização do material. Enquanto o valor por quilo não for informado, o indicador aparece como “Em apuração”.",
  },
  {
    p: "Como são calculados CO₂ evitado, árvores, água e energia?",
    r: "Esses indicadores ambientais são informados pela administração da associação a partir de relatórios e referências técnicas de reciclagem. A página nunca gera esses números automaticamente: se não houver dado informado, ele não é exibido.",
  },
  {
    p: "Com que frequência os dados são atualizados?",
    r: "Os dados de materiais são atualizados no momento em que cada pesagem é registrada. Os demais indicadores são revisados periodicamente, e a data da última atualização aparece no topo desta página.",
  },
  {
    p: "Como posso tirar dúvidas ou pedir mais informações?",
    r: "Entre em contato com a associação pelo formulário de contato do site. Parceiros e órgãos públicos podem solicitar relatórios detalhados.",
  },
];

export default function TranspFaq() {
  return (
    <section id="metodologia" className="tp-secao tp-secao--suave">
      <div className="tp-container tf-container">
        <TranspSecaoTitulo
          tag="Metodologia"
          titulo="Como os dados são produzidos"
          texto="Transparência também é explicar a origem de cada número. Veja como a associação coleta e publica as informações desta central."
        />
        <div className="tf-lista">
          {PERGUNTAS.map((q) => (
            <details key={q.p} className="tf-item">
              <summary>
                <span>{q.p}</span>
                <ChevronDown size={18} aria-hidden />
              </summary>
              <p>{q.r}</p>
            </details>
          ))}
        </div>
        <div className="tf-cta">
          <Link href="/#contato" className="tf-cta__btn">Falar com a associação</Link>
          <Link href="/projetos" className="tf-cta__btn tf-cta__btn--claro">Conhecer projetos</Link>
        </div>
      </div>
    </section>
  );
}
