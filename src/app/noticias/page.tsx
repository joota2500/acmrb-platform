"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase";

import "@/styles/noticias-page.css";

type Noticia = {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  imagem_url: string;
  slug: string;
  destaque: boolean;
  created_at: string;
};

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarNoticias() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
          id,
          titulo,
          resumo,
          categoria,
          imagem_url,
          slug,
          destaque,
          created_at
        `,
        )
        .eq("publicado", true)
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setNoticias(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarNoticias();
  }, []);

  return (
    <main className="noticias-page">
      <div className="noticias-page__bg" />

      <section className="noticias-page__hero">
        <div className="noticias-page__container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="noticias-page__hero-content"
          >
            {/* Linha 1: só o botão voltar */}
            <div className="noticias-page__row">
              <Link href="/" className="noticias-page__back">
                <ArrowLeft size={18} />
                Voltar ao portal
              </Link>
            </div>

            {/* Linha 2: só a tag */}
            <div className="noticias-page__row">
              <span className="noticias-page__tag">Portal de Notícias</span>
            </div>

            <h1 className="noticias-page__title">
              Transparência, impacto ambiental e ações sociais.
            </h1>

            <p className="noticias-page__description">
              Acompanhe projetos, sustentabilidade, educação ambiental,
              logística reversa e iniciativas desenvolvidas pela ACMRB.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="noticias-page__list">
        <div className="noticias-page__container">
          {loading && (
            <div className="noticias-page__grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="noticias-page__skeleton" />
              ))}
            </div>
          )}

          {!loading && noticias.length === 0 && (
            <div className="noticias-page__empty">
              <Newspaper size={36} />
              <h2>Nenhuma notícia publicada</h2>
              <p>
                Em breve você encontrará aqui as atualizações e ações da ACMRB.
              </p>
              <Link href="/" className="noticias-page__btn">
                Voltar ao início
              </Link>
            </div>
          )}

          {!loading && noticias.length > 0 && (
            <div className="noticias-page__grid">
              {noticias.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="noticias-page__card"
                  >
                    <div className="noticias-page__image">
                      {item.imagem_url ? (
                        <img src={item.imagem_url} alt={item.titulo} />
                      ) : (
                        <div className="noticias-page__image-fallback" />
                      )}

                      <div className="noticias-page__badges">
                        {item.categoria && (
                          <span className="noticias-page__category">
                            {item.categoria}
                          </span>
                        )}
                        {item.destaque && (
                          <span className="noticias-page__destaque">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="noticias-page__body">
                      <div className="noticias-page__date">
                        <CalendarDays size={14} />
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>

                      <h2>{item.titulo}</h2>
                      <p>{item.resumo}</p>

                      <span className="noticias-page__read">
                        Ler notícia
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
