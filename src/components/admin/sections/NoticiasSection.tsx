"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import { supabase } from "@/lib/supabase";

import NoticiasForm from "@/components/admin/news/NoticiasForm";

import NoticiasList, {
  Noticia,
} from "@/components/admin/news/NoticiasList";

import NoticiasStats from "@/components/admin/news/NoticiasStats";

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

  /*
  FORM
  */

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
    fixada,
    setFixada,
  ] = useState(false);

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

  /*
  LOAD
  */

  useEffect(() => {

    carregarNoticias();

  }, []);

  /*
  HELPERS
  */

  const gerarSlug =
    useCallback(
      (
        texto: string,
      ) => {

        return (
          texto
            .normalize(
              "NFD",
            )
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

      },
      [],
    );

  const calcularTempoLeitura =
    useCallback(
      (
        texto: string,
      ) => {

        const palavras =
          texto
            .trim()
            .split(
              /\s+/,
            ).length;

        return Math.max(
          1,
          Math.ceil(
            palavras / 200,
          ),
        );

      },
      [],
    );

  /*
  AUTH
  */

  async function verificarSessao() {

    try {

      const {
        data,
        error,
      } =
        await supabase.auth.getSession();

      if (
        error ||
        !data.session
      ) {

        alert(
          "Sessão expirada.",
        );

        window.location.href =
          "/login";

        return false;

      }

      return true;

    } catch {

      return false;

    }

  }

  /*
  LOAD NEWS
  */

  async function carregarNoticias() {

    try {

      setLoading(true);

      const ok =
        await verificarSessao();

      if (!ok) return;

      /*
      NÃO CARREGAR CONTEÚDO GIGANTE
      */

      const {
        data,
        error,
      } = await supabase
        .from("noticias")
        .select(`
          id,
          titulo,
          resumo,
          categoria,
          imagem_url,
          destaque,
          publicado,
          fixada,
          visualizacoes,
          created_at
        `)
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

        console.log(
          error,
        );

        alert(
          "Erro ao carregar notícias.",
        );

        return;

      }

      setNoticias(
        (
          data ||
          []
        ).map(
          (
            item,
          ) => ({

            id:
              item.id,

            titulo:
              item.titulo ||
              "",

            resumo:
              item.resumo ||
              "",

            conteudo:
              "",

            categoria:
              item.categoria ||
              "",

            imagem_url:
              item.imagem_url ||
              "",

            destaque:
              item.destaque ||
              false,

            publicado:
              item.publicado ||
              false,

            fixada:
              item.fixada ||
              false,

            visualizacoes:
              item.visualizacoes ||
              0,

            created_at:
              item.created_at,
          }),
        ),
      );

    } catch (
      err
    ) {

      console.log(
        err,
      );

    } finally {

      setLoading(false);

    }

  }

  /*
  RESET
  */

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

    setAutorNome(
      "ACMRB",
    );

    setBannerAlt("");

    setEditing(false);

    setEditingId(null);

  }

  /*
  UPLOAD
  */

  async function uploadImagem() {

    try {

      if (!imagem) {

        return previewImagem;

      }

      const fileName =
        `noticia-${Date.now()}-${
          imagem.name
        }`;

      const {
        error,
      } = await supabase.storage
        .from(
          "noticias",
        )
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

        alert(
          error.message,
        );

        return "";

      }

      const {
        data,
      } = supabase.storage
        .from(
          "noticias",
        )
        .getPublicUrl(
          fileName,
        );

      return data.publicUrl;

    } catch (
      err: any
    ) {

      alert(
        err.message,
      );

      return "";

    }

  }

  /*
  SAVE
  */

  async function handleSubmit() {

    try {

      setSalvando(
        true,
      );

      const ok =
        await verificarSessao();

      if (!ok) return;

      if (
        !titulo.trim()
      ) {

        alert(
          "Título obrigatório.",
        );

        return;

      }

      if (
        !conteudo.trim()
      ) {

        alert(
          "Conteúdo obrigatório.",
        );

        return;

      }

      /*
      REMOVE LIMITE
      */

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

        conteudo,

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
          seoTitle,

        seo_description:
          seoDescription,

        seo_keywords:
          seoKeywords,

        autor_nome:
          autorNome,

        banner_alt:
          bannerAlt,

        tempo_leitura:
          calcularTempoLeitura(
            conteudo,
          ),

        updated_at:
          new Date().toISOString(),
      };

      if (
        editing &&
        editingId
      ) {

        const {
          error,
        } = await supabase
          .from(
            "noticias",
          )
          .update(
            payload,
          )
          .eq(
            "id",
            editingId,
          );

        if (error) {

          alert(
            error.message,
          );

          return;

        }

      } else {

        const {
          error,
        } = await supabase
          .from(
            "noticias",
          )
          .insert(
            payload,
          );

        if (error) {

          alert(
            error.message,
          );

          return;

        }

      }

      alert(
        editing
          ? "Notícia atualizada."
          : "Notícia publicada.",
      );

      resetForm();

      await carregarNoticias();

    } catch (
      err: any
    ) {

      console.log(
        err,
      );

      alert(
        err.message ||
          "Erro inesperado.",
      );

    } finally {

      setSalvando(
        false,
      );

    }

  }

  /*
  EDIT
  */

  async function handleEdit(
    noticia: Noticia,
  ) {

    try {

      setLoading(
        true,
      );

      const {
        data,
        error,
      } = await supabase
        .from(
          "noticias",
        )
        .select("*")
        .eq(
          "id",
          noticia.id,
        )
        .single();

      if (
        error ||
        !data
      ) {

        alert(
          "Erro ao carregar notícia.",
        );

        return;

      }

      setEditing(
        true,
      );

      setEditingId(
        data.id,
      );

      setTitulo(
        data.titulo ||
          "",
      );

      setResumo(
        data.resumo ||
          "",
      );

      /*
      AQUI RESOLVE O TRAVAMENTO
      */

      requestAnimationFrame(
        () => {

          setConteudo(
            data.conteudo ||
              "",
          );

        },
      );

      setCategoria(
        data.categoria ||
          "",
      );

      setDestaque(
        !!data.destaque,
      );

      setPublicado(
        !!data.publicado,
      );

      setFixada(
        !!data.fixada,
      );

      setPreviewImagem(
        data.imagem_url ||
          "",
      );

      setSeoTitle(
        data.seo_title ||
          "",
      );

      setSeoDescription(
        data.seo_description ||
          "",
      );

      setSeoKeywords(
        data.seo_keywords ||
          "",
      );

      setAutorNome(
        data.autor_nome ||
          "ACMRB",
      );

      setBannerAlt(
        data.banner_alt ||
          "",
      );

    } catch (
      err
    ) {

      console.log(
        err,
      );

    } finally {

      setLoading(
        false,
      );

    }

  }

  /*
  DELETE
  */

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

      const {
        error,
      } = await supabase
        .from(
          "noticias",
        )
        .delete()
        .eq(
          "id",
          id,
        );

      if (error) {

        alert(
          error.message,
        );

        return;

      }

      setNoticias(
        (
          prev,
        ) =>

          prev.filter(
            (
              item,
            ) =>
              item.id !==
              id,
          ),
      );

    } catch (
      err
    ) {

      console.log(
        err,
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
            (
              n,
            ) =>
              n.publicado,
          ).length
        }
        destaques={
          noticias.filter(
            (
              n,
            ) =>
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