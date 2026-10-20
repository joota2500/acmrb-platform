"use client";

/**
 * Página /associados/[slug] — perfil público de um associado
 * ------------------------------------------------------------
 * Mostra somente informações públicas: foto, nome, cargo, tipo, bio e
 * redes sociais. Contatos pessoais (e-mail, telefone, endereço, CPF)
 * NUNCA são buscados nesta página.
 * Dados: buscarAssociadoPublico(slug) → view associados_publicos (ou a
 * tabela, só colunas públicas, antes da migration), com limite de 10s.
 *
 * Responsividade (src/styles/associados.css):
 *  - Celular: foto em cima, texto embaixo, botões largura total.
 *  - Tablet/desktop (>=768px): foto à esquerda, texto à direita.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

import { buscarAssociadoPublico } from "@/lib/associados";
import type { AssociadoPublico } from "@/types/associados";

import "@/styles/associados.css";

/** Aceita "@usuario", "usuario" ou a URL completa e devolve a URL. */
function linkRede(valor: string | null, base: string): string | null {
  if (!valor || !valor.trim()) return null;
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `${base}${v.replace(/^@/, "")}`;
}

export default function AssociadoPerfilPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params?.slug ?? "");

  const [associado, setAssociado] = useState<AssociadoPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarAssociadoPublico(slug).then(({ data, erro }) => {
      if (!ativo) return;
      setAssociado(data);
      setErro(erro);
      setLoading(false);
    });
    return () => {
      ativo = false;
    };
  }, [slug]);

  const redes = associado
    ? [
        { nome: "Instagram", url: linkRede(associado.instagram, "https://instagram.com/") },
        { nome: "LinkedIn", url: linkRede(associado.linkedin, "https://www.linkedin.com/in/") },
        { nome: "Facebook", url: linkRede(associado.facebook, "https://facebook.com/") },
      ].filter((r): r is { nome: string; url: string } => Boolean(r.url))
    : [];

  return (
    <>
      <Header />

      <main className="as-page">
        <section className="as-hero as-hero--perfil">
          <div className="as-container">
            {/* Breadcrumb completo até o associado */}
            <nav aria-label="Você está em" className="as-breadcrumb">
              <ol>
                <li><Link href="/">Início</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/quem-somos">Quem somos</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/associados">Associados</Link></li>
                {associado && (
                  <>
                    <li aria-hidden="true"><ChevronRight size={14} /></li>
                    <li aria-current="page">{associado.nome}</li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </section>

        <div className="as-container as-section as-perfil-wrap">
          {loading ? (
            <LoadingState text="Carregando perfil..." />
          ) : erro ? (
            <EmptyState
              title="Não foi possível carregar"
              description="Estamos com dificuldade para acessar os dados agora. Tente novamente em alguns instantes."
            />
          ) : !associado ? (
            <EmptyState
              title="Associado não encontrado"
              description="Este perfil não existe ou não está mais ativo."
            />
          ) : (
            <article className="as-perfil">
              <div className="as-perfil__foto">
                {associado.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={associado.foto_url} alt={`Foto de ${associado.nome}`} />
                ) : (
                  <span aria-hidden="true">{associado.nome.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="as-perfil__corpo">
                {associado.tipo_associado && (
                  <span className="as-label">{associado.tipo_associado}</span>
                )}
                <h1 className="as-perfil__nome">{associado.nome}</h1>
                {associado.cargo && <p className="as-perfil__cargo">{associado.cargo}</p>}

                {associado.bio ? (
                  <p className="as-text" lang="pt-BR">{associado.bio}</p>
                ) : (
                  <p className="as-text as-text--muted">
                    Este associado ainda não possui uma apresentação cadastrada.
                  </p>
                )}

                {redes.length > 0 && (
                  <ul className="as-redes" aria-label="Redes sociais">
                    {redes.map((r) => (
                      <li key={r.nome}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="as-btn as-btn--outline">
                          {r.nome} <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          )}

          <div className="as-voltar">
            <Link href="/associados" className="as-btn as-btn--primary">
              <ArrowLeft size={18} aria-hidden="true" /> Voltar para associados
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
