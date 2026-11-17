"use client";

/**
 * Documentos públicos (tabela transparencia_documentos, só publicados).
 * Filtro por categoria. Cadastro em Painel › Relatórios.
 */

import { useMemo, useState } from "react";
import { ExternalLink, FileText, FolderOpen } from "lucide-react";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import TituloSecao from "@/components/home/TituloSecao";
import type { DocumentoPublico } from "@/hooks/useTransparencia";
import { cn } from "@/utils/cn";

export const CATEGORIAS_DOC: Record<string, string> = {
  relatorio: "Relatório de atividades",
  prestacao_contas: "Prestação de contas",
  estatuto: "Estatuto e atas",
  certificado: "Certificados e licenças",
  outro: "Outros",
};

export default function TranspDocumentos({ documentos }: { documentos: DocumentoPublico[] }) {
  const [cat, setCat] = useState("todas");
  const categorias = useMemo(() => [...new Set(documentos.map((d) => d.categoria))], [documentos]);
  const lista = cat === "todas" ? documentos : documentos.filter((d) => d.categoria === cat);

  return (
    <section id="documentos" className="scroll-mt-32 bg-surface-alt py-14 sm:py-20">
      <Container>
        <TituloSecao
          etiqueta="Documentos"
          icone={FolderOpen}
          alinhamento="esquerda"
          className="mb-8 sm:mb-10"
          titulo={<>Relatórios e <span>prestação de contas</span></>}
          descricao="Documentos oficiais publicados pela associação para consulta de parceiros, poder público e comunidade."
        />

        {documentos.length === 0 ? (
          <EmptyState
            title="Nenhum documento ainda"
            description="Nenhum documento publicado ainda. Os relatórios oficiais serão disponibilizados aqui assim que forem aprovados."
          />
        ) : (
          <>
            {categorias.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Categorias de documentos">
                {["todas", ...categorias].map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                      cat === c ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-brand-soft",
                    )}
                  >
                    {c === "todas" ? "Todos" : CATEGORIAS_DOC[c] ?? c}
                  </button>
                ))}
              </div>
            )}
            <ul className="grid gap-3 md:grid-cols-2 sm:gap-4">
              {lista.map((d) => (
                <li key={d.id}>
                  <a
                    className="group flex h-full items-start gap-4 rounded-card border border-black/5 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brand-line hover:shadow-card-hover motion-reduce:transition-none sm:p-5"
                    href={d.url_arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="grid size-11 flex-none place-items-center rounded-xl bg-brand-mint text-leaf"><FileText size={20} aria-hidden="true" /></span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-leaf">{CATEGORIAS_DOC[d.categoria] ?? d.categoria}{d.ano ? ` • ${d.ano}` : ""}</span>
                      <strong className="text-base font-extrabold leading-snug text-ink [overflow-wrap:anywhere]">{d.titulo}</strong>
                      {d.descricao && <span className="text-sm leading-relaxed text-ink-soft">{d.descricao}</span>}
                    </span>
                    <ExternalLink size={16} aria-hidden="true" className="mt-1 flex-none text-ink-muted transition group-hover:text-leaf" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </section>
  );
}
