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

  slug?: string;

  visualizacoes?: number;

  created_at: string;

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

  async function verificarSessao() {

    const {
      data,
      error,
    } = await supabase.auth.getSession();

    if (
      error ||
      !data.session
    ) {

      alert(
        "Sessão expirada. Faça login novamente.",
      );

      window.location.href =
        "/login";

      return false;

    }

    return true;

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
        "Erro inesperado.",
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

    setImagem(null);

    setPreviewImagem("");

    setEditing(false);

    setEditingId(null);

  }

  async function uploadImagem() {

    if (!imagem) {

      return previewImagem;

    }

    if (
      imagem.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Imagem maior que 5MB.",
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
        "Erro no upload.",
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

      if (!conteudo.trim()) {

        alert(
          "Conteúdo obrigatório.",
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

        titulo,

        resumo,

        conteudo,

        categoria,

        imagem_url,

        destaque,

        publicado,

        slug:
          gerarSlug(
            titulo,
          ),

      };

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
            "Erro ao atualizar notícia.",
          );

          return;

        }

        alert(
          "Notícia atualizada.",
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
            "Erro ao publicar notícia.",
          );

          return;

        }

        alert(
          "Notícia publicada.",
        );

      }

      resetForm();

      carregarNoticias();

    } catch (err) {

      console.log(err);

      alert(
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

    setPreviewImagem(
      noticia.imagem_url,
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
          "Erro ao excluir.",
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