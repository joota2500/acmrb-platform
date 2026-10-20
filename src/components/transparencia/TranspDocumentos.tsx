"use client";

/**
 * Documentos públicos (tabela transparencia_documentos, só publicados).
 * Filtro por categoria. Cadastro em Painel › Relatórios.
 */

import { useMemo, useState } from "react";
import { ExternalLink, FileText, FolderOpen } from "lucide-react";
import TranspSecaoTitulo from "./TranspSecaoTitulo";
import type { DocumentoPublico } from "@/hooks/useTransparencia";
import "@/styles/transp-documentos.css";

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
    <section id="documentos" className="tp-secao">
      <div className="tp-container">
        <TranspSecaoTitulo
          tag="Documentos"
          titulo="Relatórios e prestação de contas"
          texto="Documentos oficiais publicados pela associação para consulta de parceiros, poder público e comunidade."
        />

        {documentos.length === 0 ? (
          <div className="td-vazio">
            <FolderOpen size={30} aria-hidden />
            <p>Nenhum documento publicado ainda. Os relatórios oficiais serão disponibilizados aqui assim que forem aprovados.</p>
          </div>
        ) : (
          <>
            {categorias.length > 1 && (
              <div className="td-chips" role="tablist" aria-label="Categorias de documentos">
                {["todas", ...categorias].map((c) => (
                  <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "is-ativo" : ""} onClick={() => setCat(c)}>
                    {c === "todas" ? "Todos" : CATEGORIAS_DOC[c] ?? c}
                  </button>
                ))}
              </div>
            )}
            <ul className="td-lista">
              {lista.map((d) => (
                <li key={d.id}>
                  <a className="td-doc" href={d.url_arquivo} target="_blank" rel="noopener noreferrer">
                    <span className="td-doc__icone"><FileText size={20} aria-hidden /></span>
                    <span className="td-doc__corpo">
                      <span className="td-doc__meta">{CATEGORIAS_DOC[d.categoria] ?? d.categoria}{d.ano ? ` • ${d.ano}` : ""}</span>
                      <strong>{d.titulo}</strong>
                      {d.descricao && <span className="td-doc__desc">{d.descricao}</span>}
                    </span>
                    <ExternalLink size={16} aria-hidden className="td-doc__abrir" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
