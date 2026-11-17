"use client";

/**
 * NewsSection — "Notícias e Atualizações" (página inicial)
 * ------------------------------------------------------------
 * Mostra até 3 notícias publicadas (dados do Supabase pelo hook
 * useNoticiasPublicas; a escolha das 3 está em utils/noticias → selecionarHome).
 *
 * Estados: carregando (esqueletos), erro (botão "Tentar de novo"),
 * vazio ("Nenhuma notícia publicada ainda") e lista.
 * Cada notícia usa o NoticiaCard (o mesmo da página /noticias).
 * Responsivo: 1 coluna (celular), 2 (tablet) e 3 (desktop).
 */

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Newspaper, RefreshCw } from "lucide-react";

import NoticiaCard from "@/components/noticias/NoticiaCard";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAparecer } from "@/hooks/useAparecer";
import { useNoticiasPublicas } from "@/hooks/useNoticiasPublicas";
import { selecionarHome } from "@/utils/noticias";
import TituloSecao from "./TituloSecao";

export default function NewsSection() {
  const { noticias, carregando, erro, recarregar } = useNoticiasPublicas(60);
  const aparecer = useAparecer();

  // As 3 notícias que aparecem na home (destaques primeiro)
  const lista = selecionarHome(noticias, 3);

  // caixa de aviso reaproveitada nos estados de erro e vazio
  const caixaAviso =
    "mx-auto flex max-w-xl flex-col items-center gap-3 rounded-card border border-line bg-surface-alt p-8 text-center text-ink-soft";

  return (
    <section id="noticias" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="news-titulo" lang="pt-BR">
      <Container>
        <motion.div {...aparecer()}>
          <TituloSecao
            id="news-titulo"
            icone={Newspaper}
            etiqueta="Notícias e Atualizações"
            titulo={
              <>
                O que está acontecendo <span>na ACMRB</span>
              </>
            }
            descricao="Projetos, ações sociais, educação ambiental, parcerias e resultados da coleta seletiva em Baturité e no Maciço. Informação oficial da associação, publicada para a comunidade, os parceiros e o poder público acompanharem de perto o nosso trabalho."
          />
        </motion.div>

        {/* Carregando: 3 esqueletos piscando */}
        {carregando && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando notícias">
            {[0, 1, 2].map((n) => (
              <div key={n} className="h-96 animate-pulse rounded-card bg-surface-alt" />
            ))}
          </div>
        )}

        {/* Erro ao buscar no banco */}
        {!carregando && erro && (
          <div className={caixaAviso} role="alert">
            <AlertTriangle size={28} className="text-warning" aria-hidden="true" />
            <p>{erro}</p>
            <Button type="button" onClick={recarregar} variante="secundario">
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </Button>
          </div>
        )}

        {/* Nenhuma notícia publicada */}
        {!carregando && !erro && lista.length === 0 && (
          <div className={caixaAviso}>
            <Newspaper size={28} className="text-leaf" aria-hidden="true" />
            <h3 className="text-lg font-black text-ink">Nenhuma notícia publicada ainda</h3>
            <p>Em breve você vai encontrar aqui as novidades e ações da ACMRB.</p>
          </div>
        )}

        {/* Lista de notícias */}
        {!carregando && !erro && lista.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((n, i) => (
              <motion.div key={n.id} {...aparecer(0.05 + i * 0.08)} className="min-w-0">
                <NoticiaCard noticia={n} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button href="/noticias" tamanho="grande">
            Ver todas as notícias <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
