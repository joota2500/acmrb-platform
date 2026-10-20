"use client";

/**
 * useNoticiasPublicas — carrega as notícias visíveis ao público
 * ------------------------------------------------------------
 * Busca com select("*") (funciona com ou sem as colunas novas),
 * filtra por publicado = true no banco e confere status/data de
 * agendamento no navegador com visivelAoPublico().
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalizarNoticia, ordenarRecentes, visivelAoPublico, type Noticia } from "@/lib/noticias";

export function useNoticiasPublicas(limite = 300) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
        .limit(limite);
      if (error) throw error;
      const agora = Date.now();
      setNoticias(ordenarRecentes((data ?? []).map(normalizarNoticia).filter((n) => visivelAoPublico(n, agora))));
    } catch (e) {
      console.error("Erro ao carregar notícias:", e);
      setErro("Não foi possível carregar as notícias agora.");
    } finally {
      setCarregando(false);
    }
  }, [limite]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { noticias, carregando, erro, recarregar: carregar };
}
