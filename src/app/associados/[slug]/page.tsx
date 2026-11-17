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
 * Responsividade:
 *  - Celular: foto em cima, texto embaixo, botões largura total.
 *  - Tablet/desktop (>=768px): foto à esquerda, texto à direita.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, ExternalLink, UserRound } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

import { buscarAssociadoPublico } from "@/services/associados";
import type { AssociadoPublico } from "@/types/associados";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";

/** Aceita "@usuario", "usuario" ou a URL completa e devolve a URL. */
function linkRede(valor: string | null, base: string): string | null {
  if (!valor || !valor.trim()) return null;
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `${base}${v.replace(/^@/, "")}`;
}

export default function AssociadoPerfilPage() {
  const aparecer = useAparecer();
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

      <main className="min-h-screen bg-surface-alt" lang="pt-BR">
        {/* ---------- Topo: breadcrumb + nome e cargo ---------- */}
        <section className="relative isolate overflow-hidden bg-emerald-950 pb-24 pt-24 sm:pb-28 sm:pt-28" aria-labelledby={associado ? "as-nome" : undefined}>
          <span aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-sun/10 blur-3xl" />

          <Container>
            {/* Breadcrumb completo até o associado */}
            <nav aria-label="Você está em">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-emerald-200">
                <li><Link href="/" className="hover:text-white hover:underline">Início</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/quem-somos" className="hover:text-white hover:underline">Quem somos</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link href="/associados" className="hover:text-white hover:underline">Associados</Link></li>
                {associado && (
                  <>
                    <li aria-hidden="true"><ChevronRight size={14} /></li>
                    <li aria-current="page" className="font-semibold text-white">{associado.nome}</li>
                  </>
                )}
              </ol>
            </nav>

            {associado && (
              <motion.div className="mt-6 max-w-3xl" {...aparecer()}>
                {associado.tipo_associado && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
                    <UserRound size={14} className="text-emerald-300" aria-hidden="true" /> {associado.tipo_associado}
                  </span>
                )}
                <h1 id="as-nome" className="mt-4 text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
                  {associado.nome}
                </h1>
                {associado.cargo && <p className="mt-3 text-lg font-bold text-emerald-300 sm:text-xl">{associado.cargo}</p>}
              </motion.div>
            )}
          </Container>
        </section>

        <Container tamanho="medio" className="relative z-10 -mt-12 pb-16 sm:-mt-14 sm:pb-24">
          {loading ? (
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-pop" role="status" aria-busy="true" aria-label="Carregando perfil" />
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
            <motion.article
              {...aparecer(0.05)}
              className="grid gap-6 rounded-3xl border border-black/5 bg-white p-4 shadow-pop md:grid-cols-[17rem_1fr] md:gap-8 md:p-7 lg:grid-cols-[21rem_1fr] lg:gap-12 lg:p-9"
            >
              <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-brand-mint md:mx-0">
                {associado.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={associado.foto_url} alt={`Foto de ${associado.nome}`} className="size-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="grid size-full place-items-center bg-linear-to-br from-brand-mint to-brand-line text-8xl font-black text-leaf">
                    {associado.nome.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <h2 className="text-xs font-bold uppercase tracking-widest text-leaf">Sobre</h2>
                {associado.bio ? (
                  <p className="mt-3 whitespace-pre-line text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">{associado.bio}</p>
                ) : (
                  <p className="mt-3 text-ink-muted">Este associado ainda não possui uma apresentação cadastrada.</p>
                )}

                {redes.length > 0 && (
                  <div className="mt-6 border-t border-line pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-ink-muted">Redes sociais</h3>
                    <ul className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                      {redes.map((r) => (
                        <li key={r.nome}>
                          <Button href={r.url} target="_blank" rel="noopener noreferrer" variante="contorno" larguraTotal className="sm:w-auto">
                            {r.nome} <ExternalLink size={15} aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.article>
          )}

          <div className="mt-8 flex">
            <Button href="/associados" variante="secundario">
              <ArrowLeft size={18} aria-hidden="true" /> Voltar para associados
            </Button>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
