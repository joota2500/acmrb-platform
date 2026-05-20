"use client";

import { useEffect, useState } from "react";

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

  const [noticias, setNoticias] =
    useState<Noticia[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [titulo, setTitulo] =
    useState("");

  const [resumo, setResumo] =
    useState("");

  const [conteudo, setConteudo] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [destaque, setDestaque] =
    useState(false);

  const [publicado, setPublicado] =
    useState(true);

  const [imagem, setImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState("");

  async function carregarNoticias() {

    try {

      setLoading(true);

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

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarNoticias();

  }, []);

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

  async function handleSubmit() {

    try {

      setSalvando(true);

      let imagem_url = previewImagem;

      if (imagem) {

        const fileName =
          `${Date.now()}-${imagem.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("noticias")
            .upload(fileName, imagem);

        if (!uploadError) {

          const {
            data: publicUrl,
          } = supabase.storage
            .from("noticias")
            .getPublicUrl(fileName);

          imagem_url =
            publicUrl.publicUrl;

        }

      }

      const payload = {

        titulo,

        resumo,

        conteudo,

        categoria,

        imagem_url,

        destaque,

        publicado,

        slug: titulo
          .toLowerCase()
          .replaceAll(" ", "-"),

      };

      if (editing && editingId) {

        const { error } =
          await supabase
            .from("noticias")
            .update(payload)
            .eq("id", editingId);

        if (error) {

          console.log(error);

          return;

        }

      } else {

        const { error } =
          await supabase
            .from("noticias")
            .insert(payload);

        if (error) {

          console.log(error);

          return;

        }

      }

      resetForm();

      carregarNoticias();

    } finally {

      setSalvando(false);

    }

  }

  function handleEdit(
    noticia: Noticia,
  ) {

    setEditing(true);

    setEditingId(noticia.id);

    setTitulo(noticia.titulo);

    setResumo(noticia.resumo);

    setConteudo(noticia.conteudo);

    setCategoria(noticia.categoria);

    setDestaque(noticia.destaque);

    setPublicado(noticia.publicado);

    setPreviewImagem(
      noticia.imagem_url,
    );

  }

  async function handleDelete(
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

      console.log(error);

      return;

    }

    carregarNoticias();

  }

  return (

    <div className="space-y-8">

      <NoticiasStats
        total={noticias.length}
        publicadas={
          noticias.filter(
            (n) => n.publicado,
          ).length
        }
        destaques={
          noticias.filter(
            (n) => n.destaque,
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
        previewImagem={previewImagem}
        setImagem={setImagem}
        setPreviewImagem={
          setPreviewImagem
        }
        onSubmit={handleSubmit}
        onCancel={resetForm}
        loading={salvando}
        editing={editing}
      />

      <NoticiasList
        noticias={noticias}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>

  );

}