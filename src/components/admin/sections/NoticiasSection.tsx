"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import NoticiasForm from "@/components/admin/news/NoticiasForm";
import NoticiasList from "@/components/admin/news/NoticiasList";
import NoticiasStats from "@/components/admin/news/NoticiasStats";

type Noticia = {
  id: string;

  titulo: string;

  resumo: string;

  conteudo: string;

  categoria: string;

  imagem_url: string;

  destaque: boolean;

  publicado: boolean;

  fixada?: boolean;

  slug?: string;

  visualizacoes?: number;

  likes?: number;

  compartilhamentos?: number;

  seo_title?: string;

  seo_description?: string;

  seo_keywords?: string;

  autor_nome?: string;

  banner_alt?: string;

  tempo_leitura?: number;

  created_at: string;

  updated_at?: string;
};

export default function NoticiasSection() {

  const [
    noticias,
    setNoticias,
  ] = useState<
    Noticia[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    titulo,
    setTitulo,
  ] = useState("");

  const [
    resumo,
    setResumo,
  ] = useState("");

  const [
    conteudo,
    setConteudo,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  const [
    destaque,
    setDestaque,
  ] = useState(false);

  const [
    publicado,
    setPublicado,
  ] = useState(true);

  const [
    imagem,
    setImagem,
  ] = useState<
    File | null
  >(null);

  const [
    previewImagem,
    setPreviewImagem,
  ] = useState("");

  const [
    fixada,
    setFixada,
  ] = useState(false);

  const [
    seoTitle,
    setSeoTitle,
  ] = useState("");

  const [
    seoDescription,
    setSeoDescription,
  ] = useState("");

  const [
    seoKeywords,
    setSeoKeywords,
  ] = useState("");

  const [
    autorNome,
    setAutorNome,
  ] = useState("ACMRB");

  const [
    bannerAlt,
    setBannerAlt,
  ] = useState("");

  useEffect(() => {

    carregarNoticias();

  }, []);

  function gerarSlug(
    texto: string,
  ) {

    return (
      texto
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .toLowerCase()
        .trim()
        .replace(
          /[^\w\s-]/g,
          "",
        )
        .replace(
          /\s+/g,
          "-",
        ) +
      "-" +
      Date.now()
    );

  }

  function calcularTempoLeitura(
    texto: string,
  ) {

    const palavras =
      texto
        .trim()
        .split(/\s+/).length;

    return Math.max(
      1,
      Math.ceil(
        palavras / 200,
      ),
    );

  }

  async function verificarSessao() {

    try {

      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (
        error ||
        !data.session
      ) {

        console.log(
          "Sessão inválida:",
          error,
        );

        alert(
          "Sessão expirada. Faça login novamente.",
        );

        window.location.href =
          "/login";

        return false;

      }

      return true;

    } catch (err) {

      console.log(err);

      return false;

    }

  }

  async function carregarNoticias() {

    try {

      setLoading(true);

      const sessaoOk =
        await verificarSessao();

      if (!sessaoOk)
        return;

      const {
        data,
        error,
      } = await supabase
        .from("noticias")
        .select("*")
        .order(
          "fixada",
          {
            ascending: false,
          },
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

      if (error) {

        console.log(error);

        alert(
          "Erro ao carregar notícias.",
        );

        return;

      }

      setNoticias(
        data || [],
      );

    } catch (err) {

      console.log(err);

      alert(
        "Erro inesperado ao carregar notícias.",
      );

    } finally {

      setLoading(false);

    }

  }

  function resetForm() {

    setTitulo("");

    setResumo("");

    setConteudo("");

    setCategoria("");

    setDestaque(false);

    setPublicado(true);

    setFixada(false);

    setImagem(null);

    setPreviewImagem("");

    setSeoTitle("");

    setSeoDescription("");

    setSeoKeywords("");

    setBannerAlt("");

    setAutorNome("ACMRB");

    setEditing(false);

    setEditingId(null);

  }

  async function uploadImagem() {

    try {

      if (!imagem) {

        return previewImagem;

      }

      if (
        imagem.size >
        10 * 1024 * 1024
      ) {

        alert(
          "Imagem maior que 10MB.",
        );

        return "";
      }

      const extensao =
        imagem.name
          .split(".")
          .pop();

      const fileName =
        `noticia-${Date.now()}.${extensao}`;

      const {
        error,
      } = await supabase.storage
        .from("noticias")
        .upload(
          fileName,
          imagem,
          {

            cacheControl:
              "3600",

            upsert: true,

          },
        );

      if (error) {

        console.log(error);

        alert(
          "Erro ao fazer upload da imagem.",
        );

        return "";

      }

      const {
        data,
      } = supabase.storage
        .from("noticias")
        .getPublicUrl(
          fileName,
        );

      return data.publicUrl;

    } catch (err) {

      console.log(err);

      alert(
        "Erro inesperado no upload.",
      );

      return "";

    }

  }

  async function handleSubmit() {

    try {

      setSalvando(true);

      const sessaoOk =
        await verificarSessao();

      if (!sessaoOk)
        return;

      if (!titulo.trim()) {

        alert(
          "Título obrigatório.",
        );

        return;

      }

      if (
        titulo.length <
        5
      ) {

        alert(
          "Título muito curto.",
        );

        return;

      }

      if (!conteudo.trim()) {

        alert(
          "Conteúdo obrigatório.",
        );

        return;

      }

      if (
        conteudo.length <
        50
      ) {

        alert(
          "Conteúdo muito curto.",
        );

        return;

      }

      if (
        conteudo.length >
        200000
      ) {

        alert(
          "Conteúdo muito grande.",
        );

        return;

      }

      let imagem_url =
        previewImagem;

      if (imagem) {

        imagem_url =
          await uploadImagem();

      }

      const payload = {

        titulo:
          titulo.trim(),

        resumo:
          resumo.trim(),

        conteudo:
          conteudo.trim(),

        categoria:
          categoria.trim(),

        imagem_url,

        destaque,

        publicado,

        fixada,

        slug:
          gerarSlug(
            titulo,
          ),

        seo_title:
          seoTitle ||
          titulo,

        seo_description:
          seoDescription ||
          resumo,

        seo_keywords:
          seoKeywords,

        autor_nome:
          autorNome,

        banner_alt:
          bannerAlt ||
          titulo,

        tempo_leitura:
          calcularTempoLeitura(
            conteudo,
          ),

        updated_at:
          new Date().toISOString(),

      };

      console.log(
        "ENVIANDO:",
        payload,
      );

      if (
        editing &&
        editingId
      ) {

        const {
          error,
        } = await supabase
          .from("noticias")
          .update(
            payload,
          )
          .eq(
            "id",
            editingId,
          );

        if (error) {

          console.log(error);

          alert(
            error.message,
          );

          return;

        }

        alert(
          "Notícia atualizada com sucesso.",
        );

      } else {

        const {
          error,
        } = await supabase
          .from("noticias")
          .insert(
            payload,
          );

        if (error) {

          console.log(error);

          alert(
            error.message,
          );

          return;

        }

        alert(
          "Notícia publicada com sucesso.",
        );

      }

      resetForm();

      await carregarNoticias();

    } catch (err: any) {

      console.log(err);

      alert(
        err?.message ||
          "Erro inesperado.",
      );

    } finally {

      setSalvando(false);

    }

  }

  function handleEdit(
    noticia: Noticia,
  ) {

    setEditing(true);

    setEditingId(
      noticia.id,
    );

    setTitulo(
      noticia.titulo,
    );

    setResumo(
      noticia.resumo,
    );

    setConteudo(
      noticia.conteudo,
    );

    setCategoria(
      noticia.categoria,
    );

    setDestaque(
      noticia.destaque,
    );

    setPublicado(
      noticia.publicado,
    );

    setFixada(
      noticia.fixada ||
        false,
    );

    setPreviewImagem(
      noticia.imagem_url,
    );

    setSeoTitle(
      noticia.seo_title ||
        "",
    );

    setSeoDescription(
      noticia.seo_description ||
        "",
    );

    setSeoKeywords(
      noticia.seo_keywords ||
        "",
    );

    setAutorNome(
      noticia.autor_nome ||
        "ACMRB",
    );

    setBannerAlt(
      noticia.banner_alt ||
        "",
    );

  }

  async function handleDelete(
    id: string,
  ) {

    const confirmar =
      confirm(
        "Excluir notícia?",
      );

    if (!confirmar)
      return;

    try {

      const sessaoOk =
        await verificarSessao();

      if (!sessaoOk)
        return;

      const {
        error,
      } = await supabase
        .from("noticias")
        .delete()
        .eq(
          "id",
          id,
        );

      if (error) {

        console.log(error);

        alert(
          "Erro ao excluir notícia.",
        );

        return;

      }

      setNoticias(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !==
              id,
          ),
      );

      alert(
        "Notícia excluída.",
      );

    } catch (err) {

      console.log(err);

      alert(
        "Erro inesperado.",
      );

    }

  }

  return (

    <div
      className="
        space-y-8
      "
    >

      <NoticiasStats
        total={
          noticias.length
        }
        publicadas={
          noticias.filter(
            (n) =>
              n.publicado,
          ).length
        }
        destaques={
          noticias.filter(
            (n) =>
              n.destaque,
          ).length
        }
        visualizacoes={
          noticias.reduce(
            (
              acc,
              item,
            ) =>

              acc +
              (
                item.visualizacoes ||
                0
              ),

            0,
          )
        }
      />

      <NoticiasForm
        titulo={titulo}
        setTitulo={
          setTitulo
        }
        resumo={resumo}
        setResumo={
          setResumo
        }
        categoria={
          categoria
        }
        setCategoria={
          setCategoria
        }
        conteudo={
          conteudo
        }
        setConteudo={
          setConteudo
        }
        destaque={
          destaque
        }
        setDestaque={
          setDestaque
        }
        publicado={
          publicado
        }
        setPublicado={
          setPublicado
        }
        previewImagem={
          previewImagem
        }
        setImagem={
          setImagem
        }
        setPreviewImagem={
          setPreviewImagem
        }
        onSubmit={
          handleSubmit
        }
        onCancel={
          resetForm
        }
        loading={
          salvando
        }
        editing={
          editing
        }

        /*
        NOVOS CAMPOS
        */

        fixada={
          fixada
        }

        setFixada={
          setFixada
        }

        seoTitle={
          seoTitle
        }

        setSeoTitle={
          setSeoTitle
        }

        seoDescription={
          seoDescription
        }

        setSeoDescription={
          setSeoDescription
        }

        seoKeywords={
          seoKeywords
        }

        setSeoKeywords={
          setSeoKeywords
        }

        autorNome={
          autorNome
        }

        setAutorNome={
          setAutorNome
        }

        bannerAlt={
          bannerAlt
        }

        setBannerAlt={
          setBannerAlt
        }
      />

      <NoticiasList
        noticias={
          noticias
        }
        loading={
          loading
        }
        onEdit={
          handleEdit
        }
        onDelete={
          handleDelete
        }
      />

    </div>

  );

}