"use client";

import {
  useEffect,
  useState,
  useCallback,
  startTransition,
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
  AUTH
  */

 async function verificarSessao() {

  try {

    console.log(
      "================================",
    );

    console.log(
      "VERIFICANDO AUTH REAL",
    );

    console.log(
      "================================",
    );

    /*
    NÃO USE getUser()
    */

    const response =
      await supabase.auth.getSession();

    console.log(
      "AUTH RESPONSE:",
      response,
    );

    if (
      response.error
    ) {

      console.log(
        "AUTH ERROR",
      );

      return false;

    }

    if (
      !response.data
        ?.session
    ) {

      console.log(
        "SEM SESSION",
      );

      return false;

    }

    console.log(
      "AUTH OK",
    );

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

      if (!ok)
        return;

      /*
      NÃO CARREGAR
      CONTEÚDO GIGANTE
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

        alert(
          error.message,
        );

        return;

      }

      startTransition(
        () => {

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

        },
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
        `noticia-${Date.now()}-${imagem.name}`;

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

            upsert: false,
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

  if (salvando) return;

  let timeoutId:
  NodeJS.Timeout | null =
    null;
  try {

    console.clear();

    console.log(
      "====================================",
    );

    console.log(
      "INICIANDO PUBLICAÇÃO",
    );

    console.log(
      "====================================",
    );

    setSalvando(true);

    /*
    SESSION
    */

    console.log(
      "VERIFICANDO SESSÃO...",
    );

    const authOk =
  await verificarSessao();

if (!authOk) {

  console.log(
    "AUTH FALHOU",
  );

  return;

}

    /*
    VALIDATION
    */

    console.log(
      "VALIDANDO FORMULÁRIO...",
    );

    if (!titulo.trim()) {

      alert(
        "Título obrigatório.",
      );

      return;

    }

    if (!conteudo.trim()) {

      alert(
        "Conteúdo obrigatório.",
      );

      return;

    }

    /*
    DEBUG TEXTO
    */

    console.log(
      "TAMANHO CONTEÚDO:",
      conteudo.length,
    );

    console.log(
      "TAMANHO RESUMO:",
      resumo.length,
    );

    console.log(
      "TAMANHO TÍTULO:",
      titulo.length,
    );

    /*
    UPLOAD
    */

    let imagem_url =
      previewImagem;

    if (imagem) {

      console.log(
        "FAZENDO UPLOAD...",
      );

      const fileName =
        `noticia-${Date.now()}-${imagem.name}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("noticias")
        .upload(
          fileName,
          imagem,
          {
            cacheControl:
              "3600",
            upsert: false,
          },
        );

      console.log(
        "UPLOAD ERROR:",
        uploadError,
      );

      if (uploadError) {

        alert(
          uploadError.message,
        );

        return;

      }

      const {
        data: imageData,
      } = supabase.storage
        .from("noticias")
        .getPublicUrl(
          fileName,
        );

      imagem_url =
        imageData.publicUrl;

      console.log(
        "UPLOAD OK:",
        imagem_url,
      );

    }

    /*
    PAYLOAD
    */

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
        titulo.trim()
          ? gerarSlug(titulo)
          : `noticia-${Date.now()}`,

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
          conteudo, 
        ),

      updated_at:
        new Date().toISOString(),
    };

    console.log(
      "PAYLOAD:",
      payload,
    );

    console.log(
      "PAYLOAD SIZE:",
      JSON.stringify(
        payload,
      ).length,
    );

    /*
    TIMEOUT
    */

    timeoutId =
      setTimeout(
        () => {

          console.error(
            "TIMEOUT SUPABASE",
          );

          alert(
            "Supabase demorou demais para responder.",
          );

          setSalvando(
            false,
          );

        },
        30000,
      );

    /*
    UPDATE
    */

    if (
      editing &&
      editingId
    ) {

      console.log(
        "ATUALIZANDO...",
      );

      const response =
        await supabase
          .from(
            "noticias",
          )
          .update( payload,)
          .eq("id",editingId,);

     if (timeoutId) {

  clearTimeout(
    timeoutId,
  );

}
      

      console.log(
        "UPDATE RESPONSE:",
        response,
      );

      if (
        response.error
      ) {

        console.error(
          "UPDATE ERROR:",
          response.error,
        );

        alert(
          JSON.stringify(
            response.error,
            null,
            2,
          ),
        );

        return;

      }

      console.log(
        "UPDATE OK",
      );

    }

    /*
    INSERT
    */

    else {

      console.log(
        "INSERINDO...",
      );

      const response =
        await supabase
          .from(
            "noticias",
          )
          .insert([payload]);

     if (timeoutId) {

  clearTimeout(
    timeoutId,
  );

}

      console.log(
        "INSERT RESPONSE:",
        response,
      );

      if (
        response.error
      ) {

        console.error(
          "INSERT ERROR:",
          response.error,
        );

        alert(
          JSON.stringify(
            response.error,
            null,
            2,
          ),
        );

        return;

      }

      console.log(
        "INSERT OK",
      );

    }

    console.log(
      "FINALIZADO COM SUCESSO",
    );

    alert(
      editing
        ? "Notícia atualizada."
        : "Notícia publicada.",
    );

    resetForm();

    //await carregarNoticias();

  } catch (
    err: any
  ) {

    console.error(
      "ERRO GERAL:",
      err,
    );

    alert(
      JSON.stringify(
        err,
        null,
        2,
      ),
    );

  } finally {

    if (timeoutId) {

  clearTimeout(
    timeoutId,
  );

}

    setSalvando(
      false,
    );

    console.log(
      "FIM PROCESSO",
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

      /*
      PEQUENOS PRIMEIRO
      */

      setTitulo(
        data.titulo ||
          "",
      );

      setResumo(
        data.resumo ||
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

      /*
      CONTEÚDO GIGANTE
      DEPOIS
      */

      requestAnimationFrame(
        () => {

          startTransition(
            () => {

              setConteudo(
                data.conteudo ||
                  "",
              );

            },
          );

        },
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

    } catch {}

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