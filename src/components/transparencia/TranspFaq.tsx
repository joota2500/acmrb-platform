"use client";

/** Perguntas frequentes sobre a metodologia (acordeão acessível com <details>) */

import { ArrowRight, ChevronDown, FolderKanban, HelpCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FaixaCta from "@/components/home/FaixaCta";
import TituloSecao from "@/components/home/TituloSecao";

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
    <section id="metodologia" className="scroll-mt-32 bg-white py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Metodologia"
          icone={HelpCircle}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Como os dados são <span>produzidos</span></>}
          descricao="Transparência também é explicar a origem de cada número. Veja como a associação coleta e publica as informações desta central."
        />

        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {PERGUNTAS.map((q) => (
            <details key={q.p} className="group rounded-card border border-black/5 bg-white shadow-card open:border-brand-line open:bg-brand-soft/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card p-4 font-bold text-ink marker:hidden focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-line sm:p-5 [&::-webkit-details-marker]:hidden">
                <span>{q.p}</span>
                <ChevronDown size={18} className="flex-none text-leaf transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p lang="pt-BR" className="texto-justo px-4 pb-5 leading-relaxed text-ink-soft sm:px-5">{q.r}</p>
            </details>
          ))}
        </div>

        <FaixaCta
          titulo="Ficou com alguma dúvida?"
          texto="Fale com a associação ou conheça os projetos que geram os números desta central."
        >
          <Button href="/#contato" variante="claro" tamanho="grande">
            Falar com a associação <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <Button href="/projetos" variante="contornoClaro" tamanho="grande">
            <FolderKanban size={18} aria-hidden="true" /> Conhecer projetos
          </Button>
        </FaixaCta>
      </Container>
    </section>
  );
}
