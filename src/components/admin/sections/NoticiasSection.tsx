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

  /*
  STATES
  */

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
    erro,
    setErro,
  ] = useState("");

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
  INIT
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
            )
            .filter(
              Boolean,
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
  SANITIZE HTML
  */

  function limparConteudo(
    html: string,
  ) {

    return html

      /*
      REMOVE SCRIPT
      */

      .replace(
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        "",
      )

      /*
      REMOVE IFRAMES
      */

      .replace(
        /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
        "",
      )

      .trim();

  }

  /*
  TIMEOUT
  */

 async function withTimeout<T>(
  promise: Promise<T>,
  ms = 30000,
): Promise<T> {

  const timeout =
    new Promise<never>(
      (
        _,
        reject,
      ) => {

        setTimeout(
          () => {

            reject(
              new Error(
                "Tempo limite excedido.",
              ),
            );

          },
          ms,
        );

      },
    );

  return await Promise.race([
    promise,
    timeout,
  ]) as T;

}

  /*
  AUTH
  */

  async function verificarSessao() {

    try {

      const response =
        await supabase.auth.getSession();

      if (
        response.error
      ) {

        console.error(
          "AUTH ERROR:",
          response.error,
        );

        return false;

      }

      if (
        !response.data
          ?.session
      ) {

        console.error(
          "SEM SESSÃO",
        );

        return false;

      }

      return true;

    } catch (
      err
    ) {

      console.error(
        "AUTH CATCH:",
        err,
      );

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

      if (!ok) {

        throw new Error(
          "Sessão inválida.",
        );

      }

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
        )
        .limit(50);

      if (error) {

        throw error;

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
              !!item.destaque,

            publicado:
              !!item.publicado,

            fixada:
              !!item.fixada,

            visualizacoes:
              item.visualizacoes ||
              0,

            created_at:
              item.created_at,
          }),
        ),

      );

    } catch (
      err: any
    ) {

      console.error(
        err,
      );

      setErro(
        err.message ||
        "Erro ao carregar notícias.",
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

    setErro("");

  }

  /*
  UPLOAD
  */

  async function uploadImagem() {

    try {

      if (!imagem) {

        return previewImagem;

      }

      /*
      LIMITE 10MB
      */

      if (
        imagem.size >
        10 * 1024 * 1024
      ) {

        throw new Error(
          "Imagem muito grande. Máximo 10MB.",
        );

      }

      const fileName =
        `noticia-${Date.now()}-${imagem.name}`;

      const {
        error,
      } = await withTimeout(

        supabase.storage
          .from(
            "noticias",
          )
          .upload(
            fileName,
            imagem,
            {
              cacheControl:
                "3600",

              upsert: false,
            },
          ),

      );

      if (error) {

        throw error;

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

      throw new Error(
        err.message ||
        "Erro upload imagem.",
      );

    }

  }

  /*
  SAVE
  */

  async function handleSubmit() {

    if (salvando) {

      console.log(
        "PUBLICAÇÃO EM ANDAMENTO",
      );

      return;

    }

    try {

      setErro("");

      setSalvando(true);

      /*
      AUTH
      */

      const authOk =
        await verificarSessao();

      if (!authOk) {

        throw new Error(
          "Sessão inválida.",
        );

      }

      /*
      VALIDATION
      */

      if (!titulo.trim()) {

        throw new Error(
          "Título obrigatório.",
        );

      }

      if (!conteudo.trim()) {

        throw new Error(
          "Conteúdo obrigatório.",
        );

      }

      /*
      DETECTA BASE64
      */

      if (
        conteudo.includes(
          "data:image",
        )
      ) {

        throw new Error(
          "O editor inseriu imagens em base64 dentro do conteúdo. Isso pode travar publicações.",
        );

      }

      /*
      SANITIZA HTML
      */

      const conteudoLimpo =
        limparConteudo(
          conteudo,
        );

      /*
      TAMANHO REAL
      */

      const tamanhoBytes =
        new Blob([
          conteudoLimpo,
        ]).size;

      console.log(
        "TAMANHO KB:",
        (
          tamanhoBytes /
          1024
        ).toFixed(2),
      );

      /*
      LIMITE 5MB
      */

      if (
        tamanhoBytes >
        5 * 1024 * 1024
      ) {

        throw new Error(
          "Conteúdo extremamente grande.",
        );

      }

      /*
      UPLOAD
      */

      let imagem_url =
        previewImagem;

      if (imagem) {

        imagem_url =
          await uploadImagem();

      }

      /*
      PAYLOAD
      */

      const payload = {

        titulo:
          titulo.trim(),

        resumo:
          resumo.trim(),

        conteudo:
          conteudoLimpo,

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
          bannerAlt,

        tempo_leitura:
          calcularTempoLeitura(
            conteudoLimpo,
          ),

        updated_at:
          new Date().toISOString(),
      };

      /*
      UPDATE
      */

      if (
        editing &&
        editingId
      ) {

       const response =
        await withTimeout(
          (async () => {

            return await supabase
              .from("noticias")
              .update(payload)
              .eq("id", editingId)
              .select();

          })(),
        );

        if (
          response.error
        ) {

          throw response.error;

        }

      }

      /*
      INSERT
      */

      else {

     const response =
        await withTimeout(
          (async () => {

            return await supabase
              .from("noticias")
              .insert([payload])
              .select();

          })(),
        );

        if (
          response.error
        ) {

          throw response.error;

        }

      }

      /*
      RELOAD
      */

      await carregarNoticias();

      /*
      RESET
      */

      resetForm();

      /*
      SUCCESS
      */

      console.log(
        editing
          ? "NOTÍCIA ATUALIZADA"
          : "NOTÍCIA PUBLICADA",
      );

    } catch (
      err: any
    ) {

      console.error(
        "ERRO PUBLICAÇÃO:",
        err,
      );

      setErro(

        err.message ||

        "Erro ao publicar notícia.",

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

        throw new Error(
          "Erro carregar notícia.",
        );

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

      setConteudo(
        data.conteudo ||
        "",
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
      err: any
    ) {

      console.error(
        err,
      );

      setErro(
        err.message ||
        "Erro ao editar notícia.",
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

        throw error;

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
      err: any
    ) {

      console.error(
        err,
      );

      setErro(
        err.message ||
        "Erro ao excluir notícia.",
      );

    }

  }

  return (

    <div
      className="
        space-y-8
      "
    >

      {
        erro && (

          <div
            className="
              bg-red-100
              border
              border-red-300
              text-red-700
              rounded-xl
              p-4
              font-medium
            "
          >
            {erro}
          </div>

        )
      }

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