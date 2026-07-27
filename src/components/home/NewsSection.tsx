"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase";

import "@/styles/news-section.css";

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

export default function NewsSection() {
  const [news, setNews] = useState<Noticia[]>([]);
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
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error(error);
        return;
      }

      setNews(data || []);
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
    <section id="noticias" className="news">
      <div className="news__bg" />

      <div className="news__container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="news__header"
        >
          <div>
            <span className="news__tag">Notícias e Atualizações</span>
            <h2 className="news__title">
              Transparência, impacto ambiental e ações sociais.
            </h2>
            <p className="news__description">
              Acompanhe projetos, iniciativas ambientais, ações sociais,
              educação ambiental e parcerias ESG desenvolvidas pela ACMRB.
            </p>
          </div>

          <Link href="/noticias" className="news__btn-all">
            Ver todas
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="news__grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="news__skeleton" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && news.length === 0 && (
          <div className="news__empty">
            <Newspaper size={32} />
            <h3>Nenhuma notícia publicada ainda</h3>
            <p>Em breve você encontrará aqui as atualizações da ACMRB.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && news.length > 0 && (
          <div className="news__grid">
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="news__card"
              >
                <div className="news__image">
                  {item.imagem_url ? (
                    <img src={item.imagem_url} alt={item.titulo} />
                  ) : (
                    <div className="news__image-fallback" />
                  )}

                  <div className="news__badges">
                    <span className="news__category">{item.categoria}</span>
                    {item.destaque && (
                      <span className="news__destaque">Destaque</span>
                    )}
                  </div>
                </div>

                <div className="news__body">
                  <div className="news__date">
                    <CalendarDays size={14} />
                    <span>
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h3>{item.titulo}</h3>
                  <p>{item.resumo}</p>

                  <Link href={`/noticias/${item.slug}`} className="news__read">
                    Ler mais
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
