"use client";

/**
 * useQuemSomos — dados da página /quem-somos
 * ------------------------------------------------------------
 * Busca no Supabase, em paralelo:
 *  - quem_somos_conteudo → textos institucionais (história, valores...)
 *  - associados          → SOMENTE a diretoria: Presidente, Secretário(a) e
 *                           Tesoureiro(a), nessa ordem (src/lib/associados.ts)
 *  - parceiros           → ativos, destaques primeiro
 *
 * Segurança contra falhas:
 *  - Limite de 10s (mesmo padrão do useESGMetrics). Se estourar, o
 *    carregamento termina e a página segue com o conteúdo de reserva.
 *  - Se a tabela quem_somos_conteudo não existir, der erro ou vier vazia,
 *    usa QUEM_SOMOS_FALLBACK (textos reais embutidos no código).
 *  - Sem console.log: erros viram o estado `erro` (texto amigável).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QUEM_SOMOS_FALLBACK } from "@/lib/quemSomosFallback";
import { filtrarDiretoria, listarAssociadosPublicos } from "@/lib/associados";
import type { AssociadoPublico } from "@/types/associados";
import type {
  OrigemConteudo,
  ParceiroPublico,
  QuemSomosBloco,
} from "@/types/quemSomos";

const LIMITE_MS = 10000;

/** Rejeita a promessa se ela demorar mais que LIMITE_MS. */
function comLimite<T>(p: PromiseLike<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("tempo esgotado")), LIMITE_MS);
    Promise.resolve(p).then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export function useQuemSomos() {
  const [conteudo, setConteudo] = useState<QuemSomosBloco[]>(QUEM_SOMOS_FALLBACK);
  const [origem, setOrigem] = useState<OrigemConteudo>("local");
  const [associados, setAssociados] = useState<AssociadoPublico[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true; // evita atualizar estado depois de sair da página

    async function carregar() {
      const [cont, assoc, parc] = await Promise.allSettled([
        comLimite(
          supabase
            .from("quem_somos_conteudo")
            .select("secao, ordem, rotulo, titulo, subtitulo, texto, icone")
            .eq("ativo", true)
            .order("secao")
            .order("ordem"),
        ),
        // Diretoria: view pública (ou tabela, antes da migration)
        listarAssociadosPublicos(),
        comLimite(
          supabase
            .from("parceiros")
            .select("id, nome, categoria, logo_url, site_url")
            .eq("ativo", true)
            .order("destaque", { ascending: false })
            .order("nome"),
        ),
      ]);

      if (!ativo) return;

      // Conteúdo institucional: só troca o fallback se o banco trouxe linhas
      if (cont.status === "fulfilled" && !cont.value.error && cont.value.data?.length) {
        setConteudo(cont.value.data as QuemSomosBloco[]);
        setOrigem("banco");
      }

      if (assoc.status === "fulfilled" && !assoc.value.erro) {
        setAssociados(filtrarDiretoria(assoc.value.data));
      }
      if (parc.status === "fulfilled" && !parc.value.error) {
        setParceiros((parc.value.data ?? []) as ParceiroPublico[]);
      }

      const falhou =
        assoc.status === "rejected" ||
        Boolean(assoc.value.erro) ||
        parc.status === "rejected" ||
        Boolean(parc.value.error);
      if (falhou) {
        setErro("Não foi possível conectar ao banco de dados no momento.");
      }

      setLoading(false);
    }

    carregar().catch(() => {
      if (ativo) {
        setErro("Não foi possível conectar ao banco de dados no momento.");
        setLoading(false);
      }
    });

    return () => {
      ativo = false;
    };
  }, []);

  /** Atalho: blocos de uma seção, já em ordem. */
  const secao = (nome: QuemSomosBloco["secao"]) =>
    conteudo.filter((b) => b.secao === nome).sort((a, b) => a.ordem - b.ordem);

  return { secao, origem, associados, parceiros, loading, erro };
}
