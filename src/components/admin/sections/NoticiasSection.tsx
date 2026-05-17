"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import NoticiasForm from "../news/NoticiasForm";

import NoticiasStats from "../news/NoticiasStats";

import NoticiasList from "../news/NoticiasList";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  slug?: string;

  visualizacoes?: number;

  created_at: string;
};

export default function NoticiasSection() {

  const [noticias, setNoticias] =
    useState<Noticia[]>([]);

  const [titulo, setTitulo] =
    useState("");

  const [resumo, setResumo] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [conteudo, setConteudo] =
    useState("");

  const [imagem, setImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState("");

  const [destaque, setDestaque] =
    useState(false);

  const [publicado, setPublicado] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [
    editandoNoticiaId,
    setEditandoNoticiaId,
  ] = useState<string | null>(null);

  const [
    loadingNoticias,
    setLoadingNoticias,
  ] = useState(true);

  async function carregarNoticias() {

    try {

      setLoadingNoticias(true);

      const { data, error } =
        await supabase
          .from("noticias")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {

        console.log(error);

        return;

      }

      setNoticias(data || []);

    } finally {

      setLoadingNoticias(false);

    }

  }

  function gerarSlug(texto: string) {

    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  }

  function resetFormulario() {

    setTitulo("");

    setResumo("");

    setCategoria("");

    setConteudo("");

    setImagem(null);

    setPreviewImagem("");

    setDestaque(false);

    setPublicado(true);

    setEditandoNoticiaId(null);

  }

  async function salvarNoticia() {

    if (
      !titulo ||
      !resumo ||
      !categoria ||
      !conteudo
    ) {

      alert(
        "Preencha todos os campos obrigatórios.",
      );

      return;

    }

    try {

      setLoading(true);

      const slug =
        gerarSlug(titulo);

      let imagemPublica =
        previewImagem || "";

      /* UPLOAD */

      if (imagem) {

        const extensao =
          imagem.name
            .split(".")
            .pop();

        const nomeArquivo =
          `${Date.now()}.${extensao}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("noticias")
          .upload(
            `banners/${nomeArquivo}`,
            imagem,
            {
              upsert: true,
            },
          );

        if (uploadError) {

          alert(uploadError.message);

          return;

        }

        const {
          data: imagemData,
        } = supabase.storage
          .from("noticias")
          .getPublicUrl(
            `banners/${nomeArquivo}`,
          );

        imagemPublica =
          imagemData.publicUrl;

      }

      let error = null;

      /* UPDATE */

      if (editandoNoticiaId) {

        const response =
          await supabase
            .from("noticias")
            .update({

              titulo,

              resumo,

              categoria,

              conteudo,

              imagem_url:
                imagemPublica,

              destaque,

              publicado,

              slug,

            })
            .eq(
              "id",
              editandoNoticiaId,
            );

        error = response.error;

      }

      /* CREATE */

      else {

        const response =
          await supabase
            .from("noticias")
            .insert({

              titulo,

              resumo,

              categoria,

              conteudo,

              imagem_url:
                imagemPublica,

              destaque,

              publicado,

              slug,

            });

        error = response.error;

      }

      if (error) {

        alert(error.message);

        return;

      }

      alert(
        editandoNoticiaId
          ? "Notícia atualizada com sucesso."
          : "Notícia publicada com sucesso.",
      );

      resetFormulario();

      carregarNoticias();

    } catch {

      alert(
        "Erro inesperado ao salvar notícia.",
      );

    } finally {

      setLoading(false);

    }

  }

  async function excluirNoticia(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Deseja excluir esta notícia?",
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("noticias")
        .delete()
        .eq("id", id);

    if (error) {

      alert(error.message);

      return;

    }

    carregarNoticias();

  }

  function editarNoticia(
    noticia: Noticia,
  ) {

    setEditandoNoticiaId(
      noticia.id,
    );

    setTitulo(noticia.titulo);

    setResumo(noticia.resumo);

    setCategoria(
      noticia.categoria,
    );

    setConteudo(
      noticia.conteudo || "",
    );

    setPreviewImagem(
      noticia.imagem_url || "",
    );

    setDestaque(
      noticia.destaque,
    );

    setPublicado(
      noticia.publicado,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }

  useEffect(() => {

    carregarNoticias();

  }, []);

  return (

    <div className="space-y-8">

      {/* STATS */}

      <NoticiasStats
        total={noticias.length}
        publicadas={
          noticias.filter(
            (item) =>
              item.publicado,
          ).length
        }
        destaques={
          noticias.filter(
            (item) =>
              item.destaque,
          ).length
        }
        visualizacoes={
          noticias.reduce(
            (acc, item) =>
              acc +
              (item.visualizacoes || 0),
            0,
          )
        }
      />

      {/* FORM */}

      <NoticiasForm
        titulo={titulo}
        setTitulo={setTitulo}

        resumo={resumo}
        setResumo={setResumo}

        categoria={categoria}
        setCategoria={setCategoria}

        conteudo={conteudo}
        setConteudo={setConteudo}

        destaque={destaque}
        setDestaque={setDestaque}

        publicado={publicado}
        setPublicado={setPublicado}

        previewImagem={
          previewImagem
        }

        setImagem={setImagem}

        setPreviewImagem={
          setPreviewImagem
        }

        onSubmit={salvarNoticia}

        onCancel={resetFormulario}

        loading={loading}

        editing={
          !!editandoNoticiaId
        }
      />

      {/* LIST */}

      <NoticiasList
        noticias={noticias}
        loading={loadingNoticias}
        onEdit={editarNoticia}
        onDelete={excluirNoticia}
      />

    </div>

  );

}