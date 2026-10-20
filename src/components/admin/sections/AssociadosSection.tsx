"use client";

/**
 * AssociadosSection — gestão de associados no painel admin
 * ------------------------------------------------------------
 * - Formulário com react-hook-form + zod: CPF validado pelos dígitos
 *   verificadores, e-mail, máscaras de CPF/telefone, campos obrigatórios.
 * - Antes de salvar, verifica duplicados (CPF, e-mail, nome + data de
 *   nascimento) e mostra o aviso em português. Se o banco ainda recusar
 *   (erro 23505 = valor único repetido), a mensagem também é traduzida.
 * - Slug (endereço do perfil público) gerado automaticamente e único.
 * - Editar e inativar (exclusão lógica: status "inativo", o registro
 *   continua no banco) com caixa de confirmação. Também permite reativar.
 * - Avisos com Toast (src/components/ui/Toast.tsx).
 * Dados: src/lib/associadosAdmin.ts (view associados_admin ou tabela).
 * Foto: bucket "associados" do Supabase Storage (igual à versão anterior).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
  ImageIcon,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  UserMinus,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  listarAssociadosAdmin,
  mensagemErroBanco,
  slugUnico,
  verificarDuplicados,
} from "@/lib/associadosAdmin";
import { mascaraCPF, mascaraTelefone, somenteDigitos, validarCPF } from "@/lib/validacao";
import { normalizar } from "@/lib/associados";
import type { AssociadoAdmin, StatusAssociado } from "@/types/associados";
import { ToastArea, useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

/* ==================== Opções padrão ==================== */
const CARGOS = [
  "Presidente",
  "Vice-presidente",
  "Secretário(a)",
  "Tesoureiro(a)",
  "Conselho fiscal",
  "Catador(a)",
  "Voluntário(a)",
];
const TIPOS = ["Presidência", "Diretoria", "Catador", "Voluntário", "Colaborador"];
const STATUS: { valor: StatusAssociado; rotulo: string }[] = [
  { valor: "ativo", rotulo: "Ativo" },
  { valor: "afastado", rotulo: "Afastado" },
  { valor: "inativo", rotulo: "Inativo" },
];

/* ==================== Validação (zod) ==================== */
const opcional = z.string().trim().optional().or(z.literal(""));
const telefone = z
  .string()
  .optional()
  .refine((v) => !v || [10, 11].includes(somenteDigitos(v).length), "Telefone incompleto: use DDD + número.");

const esquema = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome completo (mínimo 3 letras)."),
    cpf: z
      .string()
      .optional()
      .refine((v) => !v || validarCPF(v), "CPF inválido. Confira os números."),
    data_nascimento: opcional,
    data_entrada: opcional,
    cargo: z.string().trim().min(2, "Informe o cargo."),
    tipo_associado: z.string().trim().min(2, "Selecione o tipo de associado."),
    status: z.enum(["ativo", "inativo", "afastado"]),
    email: z.string().trim().email("E-mail inválido.").optional().or(z.literal("")),
    telefone,
    whatsapp: telefone,
    endereco: opcional,
    bairro: opcional,
    bio: z.string().max(1000, "A apresentação pode ter no máximo 1000 caracteres.").optional(),
    instagram: opcional,
    linkedin: opcional,
    facebook: opcional,
    ordem_exibicao: opcional,
    destaque: z.boolean(),
  })
  .refine(
    (d) => !d.data_nascimento || new Date(d.data_nascimento) < new Date(),
    { path: ["data_nascimento"], message: "A data de nascimento não pode ser no futuro." },
  );

type FormValores = z.infer<typeof esquema>;

/** Liga o zod ao react-hook-form (sem depender de @hookform/resolvers). */
const resolver: Resolver<FormValores> = async (valores) => {
  const r = esquema.safeParse(valores);
  if (r.success) return { values: r.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  r.error.issues.forEach((i) => {
    const campo = String(i.path[0]);
    if (!errors[campo]) errors[campo] = { type: i.code, message: i.message };
  });
  return { values: {}, errors: errors as any };
};

const VAZIO: FormValores = {
  nome: "",
  cpf: "",
  data_nascimento: "",
  data_entrada: "",
  cargo: "",
  tipo_associado: "",
  status: "ativo",
  email: "",
  telefone: "",
  whatsapp: "",
  endereco: "",
  bairro: "",
  bio: "",
  instagram: "",
  linkedin: "",
  facebook: "",
  ordem_exibicao: "",
  destaque: false,
};

/** "" → null, para não gravar textos vazios no banco. */
const nulo = (v?: string | null) => (v && v.trim() ? v.trim() : null);

/* ==================== Componente ==================== */
export default function AssociadosSection() {
  const [lista, setLista] = useState<AssociadoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | StatusAssociado>("");
  const [confirmar, setConfirmar] = useState<{ a: AssociadoAdmin; novo: StatusAssociado } | null>(null);
  const [processando, setProcessando] = useState(false);

  const { toasts, mostrar, fechar } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValores>({ resolver, defaultValues: VAZIO });

  /* ----- Carregar lista ----- */
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista(await listarAssociadosAdmin());
    } catch (e: any) {
      mostrar("erro", mensagemErroBanco(e));
    } finally {
      setCarregando(false);
    }
  }, [mostrar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /* ----- Upload da foto (Storage) ----- */
  async function enviarFoto(): Promise<string | null> {
    if (!fotoArquivo) return fotoPreview || null;
    const ext = fotoArquivo.name.split(".").pop();
    const caminho = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("associados").upload(caminho, fotoArquivo, { upsert: true });
    if (error) {
      mostrar("aviso", "A foto não pôde ser enviada. O associado será salvo sem a nova foto.");
      return fotoPreview || null;
    }
    return supabase.storage.from("associados").getPublicUrl(caminho).data.publicUrl;
  }

  /* ----- Salvar (novo ou edição) ----- */
  const salvar = handleSubmit(async (v) => {
    // 1. Duplicados antes de enviar
    const conflito = await verificarDuplicados({
      id: editandoId,
      cpf: v.cpf,
      email: v.email,
      nome: v.nome,
      data_nascimento: nulo(v.data_nascimento),
    }).catch(() => null);

    if (conflito) {
      const campo = conflito.includes("CPF") ? "cpf" : conflito.includes("e-mail") ? "email" : "nome";
      setError(campo as keyof FormValores, { message: conflito });
      mostrar("erro", conflito);
      return;
    }

    // 2. Monta o registro
    const payload = {
      nome: v.nome.replace(/\s+/g, " ").trim(),
      cpf: nulo(somenteDigitos(v.cpf)),
      data_nascimento: nulo(v.data_nascimento),
      data_entrada: nulo(v.data_entrada),
      cargo: v.cargo.trim(),
      tipo_associado: v.tipo_associado.trim(),
      status: v.status,
      ativo: v.status === "ativo",
      email: nulo(v.email)?.toLowerCase() ?? null,
      telefone: nulo(v.telefone),
      whatsapp: nulo(v.whatsapp),
      endereco: nulo(v.endereco),
      bairro: nulo(v.bairro),
      bio: nulo(v.bio),
      instagram: nulo(v.instagram),
      linkedin: nulo(v.linkedin),
      facebook: nulo(v.facebook),
      ordem_exibicao: v.ordem_exibicao ? Number(v.ordem_exibicao) : null,
      destaque: v.destaque,
      slug: await slugUnico(v.nome, editandoId),
      foto_url: await enviarFoto(),
    };

    // 3. Grava (sem .select(): o retorno não é necessário)
    const { error } = editandoId
      ? await supabase.from("associados").update(payload).eq("id", editandoId)
      : await supabase.from("associados").insert(payload);

    if (error) {
      mostrar("erro", mensagemErroBanco(error));
      return;
    }

    mostrar("sucesso", editandoId ? "Associado atualizado com sucesso" : "Associado cadastrado com sucesso");
    limparFormulario();
    carregar();
  });

  function limparFormulario() {
    setEditandoId(null);
    setFotoArquivo(null);
    setFotoPreview("");
    reset(VAZIO);
  }

  function editar(a: AssociadoAdmin) {
    setEditandoId(a.id);
    setFotoArquivo(null);
    setFotoPreview(a.foto_url ?? "");
    reset({
      nome: a.nome ?? "",
      cpf: a.cpf ? mascaraCPF(a.cpf) : "",
      data_nascimento: a.data_nascimento ?? "",
      data_entrada: a.data_entrada ?? "",
      cargo: a.cargo ?? "",
      tipo_associado: a.tipo_associado ?? "",
      status: (a.status as StatusAssociado) ?? (a.ativo ? "ativo" : "inativo"),
      email: a.email ?? "",
      telefone: a.telefone ? mascaraTelefone(a.telefone) : "",
      whatsapp: a.whatsapp ? mascaraTelefone(a.whatsapp) : "",
      endereco: a.endereco ?? "",
      bairro: a.bairro ?? "",
      bio: a.bio ?? "",
      instagram: a.instagram ?? "",
      linkedin: a.linkedin ?? "",
      facebook: a.facebook ?? "",
      ordem_exibicao: a.ordem_exibicao != null ? String(a.ordem_exibicao) : "",
      destaque: Boolean(a.destaque),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ----- Inativar / reativar (exclusão lógica) ----- */
  async function mudarStatus() {
    if (!confirmar) return;
    setProcessando(true);
    const { a, novo } = confirmar;
    const { error } = await supabase
      .from("associados")
      .update({ status: novo, ativo: novo === "ativo" })
      .eq("id", a.id);
    setProcessando(false);
    setConfirmar(null);
    if (error) {
      mostrar("erro", mensagemErroBanco(error));
      return;
    }
    mostrar("sucesso", novo === "ativo" ? "Associado reativado" : "Associado inativado");
    if (editandoId === a.id) limparFormulario();
    carregar();
  }

  const cancelarConfirmacao = useCallback(() => setConfirmar(null), []);

  /* ----- Lista filtrada ----- */
  const statusDe = (a: AssociadoAdmin): StatusAssociado =>
    (a.status as StatusAssociado) ?? (a.ativo ? "ativo" : "inativo");

  const filtrados = useMemo(() => {
    const t = normalizar(busca);
    const tDig = somenteDigitos(busca);
    return lista.filter(
      (a) =>
        (!filtroStatus || statusDe(a) === filtroStatus) &&
        (!t ||
          normalizar(a.nome).includes(t) ||
          normalizar(a.cargo).includes(t) ||
          (tDig.length >= 3 && (a.cpf ?? "").includes(tDig))),
    );
  }, [lista, busca, filtroStatus]);

  /* ----- Estilos reutilizados ----- */
  const campo =
    "w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5E4E]";
  const rotulo = "block text-sm font-semibold text-zinc-700 mb-1.5";
  const erroTxt = (nome: keyof FormValores) =>
    errors[nome]?.message ? (
      <p role="alert" className="mt-1 text-sm text-red-600">{String(errors[nome]?.message)}</p>
    ) : null;

  return (
    <div className="space-y-8 md:space-y-10">
      <ToastArea toasts={toasts} onFechar={fechar} />

      <ConfirmDialog
        aberto={Boolean(confirmar)}
        titulo={confirmar?.novo === "ativo" ? "Reativar associado?" : "Inativar associado?"}
        mensagem={
          confirmar?.novo === "ativo"
            ? `${confirmar?.a.nome} voltará a aparecer no site.`
            : `${confirmar?.a.nome} deixará de aparecer no site. Os dados continuam guardados e o associado pode ser reativado depois.`
        }
        textoConfirmar={confirmar?.novo === "ativo" ? "Reativar" : "Inativar"}
        perigo={confirmar?.novo !== "ativo"}
        carregando={processando}
        onConfirmar={mudarStatus}
        onCancelar={cancelarConfirmacao}
      />

      {/* ===== Cabeçalho ===== */}
      <header>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDF5EC] text-[#2E5E4E] font-bold text-sm">
          <ShieldCheck size={16} aria-hidden="true" /> Painel institucional ACMRB
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-black text-[#111827]">Gestão de associados</h1>
        <p className="mt-3 text-zinc-500 md:text-lg max-w-3xl text-justify hyphens-auto" lang="pt-BR">
          Cadastre, edite e inative associados. Apenas nome, cargo, tipo, foto,
          apresentação e redes sociais aparecem no site; CPF, contatos e endereço
          ficam visíveis somente para administradores.
        </p>
      </header>

      {/* ===== Formulário ===== */}
      <form onSubmit={salvar} noValidate className="bg-white rounded-3xl border border-black/5 p-5 md:p-8 space-y-6">
        <h2 className="text-xl md:text-2xl font-black text-zinc-900">
          {editandoId ? "Editar associado" : "Novo associado"}
        </h2>

        <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="sr-only">Dados pessoais</legend>
          <div className="sm:col-span-2">
            <label htmlFor="f-nome" className={rotulo}>Nome completo *</label>
            <input id="f-nome" className={campo} {...register("nome")} aria-invalid={!!errors.nome} />
            {erroTxt("nome")}
          </div>
          <div>
            <label htmlFor="f-cpf" className={rotulo}>CPF</label>
            <input
              id="f-cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              className={campo}
              {...register("cpf", { onChange: (e) => setValue("cpf", mascaraCPF(e.target.value)) })}
              aria-invalid={!!errors.cpf}
            />
            {erroTxt("cpf")}
          </div>
          <div>
            <label htmlFor="f-nasc" className={rotulo}>Data de nascimento</label>
            <input id="f-nasc" type="date" className={campo} {...register("data_nascimento")} />
            {erroTxt("data_nascimento")}
          </div>
          <div>
            <label htmlFor="f-entrada" className={rotulo}>Data de entrada</label>
            <input id="f-entrada" type="date" className={campo} {...register("data_entrada")} />
          </div>
          <div>
            <label htmlFor="f-status" className={rotulo}>Situação *</label>
            <select id="f-status" className={campo} {...register("status")}>
              {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="text-sm font-bold uppercase tracking-wide text-[#2E5E4E] mb-2">Função na associação</legend>
          <div>
            <label htmlFor="f-cargo" className={rotulo}>Cargo *</label>
            <input id="f-cargo" list="lista-cargos" className={campo} {...register("cargo")} aria-invalid={!!errors.cargo} />
            <datalist id="lista-cargos">
              {CARGOS.map((c) => <option key={c} value={c} />)}
            </datalist>
            {erroTxt("cargo")}
          </div>
          <div>
            <label htmlFor="f-tipo" className={rotulo}>Tipo de associado *</label>
            <input id="f-tipo" list="lista-tipos" className={campo} {...register("tipo_associado")} aria-invalid={!!errors.tipo_associado} />
            <datalist id="lista-tipos">
              {TIPOS.map((t) => <option key={t} value={t} />)}
            </datalist>
            {erroTxt("tipo_associado")}
          </div>
          <div>
            <label htmlFor="f-ordem" className={rotulo}>Ordem de exibição</label>
            <input id="f-ordem" type="number" min={0} className={campo} {...register("ordem_exibicao")} />
          </div>
          <label className="flex items-center gap-3 min-h-12 sm:col-span-2 lg:col-span-3">
            <input type="checkbox" className="w-5 h-5 accent-[#2E5E4E]" {...register("destaque")} />
            <span className="font-medium text-zinc-700">Destacar no site</span>
          </label>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="text-sm font-bold uppercase tracking-wide text-[#2E5E4E] mb-2">Contato e endereço (somente admin)</legend>
          <div>
            <label htmlFor="f-email" className={rotulo}>E-mail</label>
            <input id="f-email" type="email" className={campo} {...register("email")} aria-invalid={!!errors.email} />
            {erroTxt("email")}
          </div>
          <div>
            <label htmlFor="f-tel" className={rotulo}>Telefone</label>
            <input
              id="f-tel"
              inputMode="tel"
              placeholder="(85) 99999-9999"
              className={campo}
              {...register("telefone", { onChange: (e) => setValue("telefone", mascaraTelefone(e.target.value)) })}
            />
            {erroTxt("telefone")}
          </div>
          <div>
            <label htmlFor="f-whats" className={rotulo}>WhatsApp</label>
            <input
              id="f-whats"
              inputMode="tel"
              placeholder="(85) 99999-9999"
              className={campo}
              {...register("whatsapp", { onChange: (e) => setValue("whatsapp", mascaraTelefone(e.target.value)) })}
            />
            {erroTxt("whatsapp")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="f-end" className={rotulo}>Endereço</label>
            <input id="f-end" className={campo} {...register("endereco")} />
          </div>
          <div>
            <label htmlFor="f-bairro" className={rotulo}>Bairro</label>
            <input id="f-bairro" className={campo} {...register("bairro")} />
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="text-sm font-bold uppercase tracking-wide text-[#2E5E4E] mb-2">Perfil público</legend>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="f-bio" className={rotulo}>Apresentação</label>
            <textarea id="f-bio" rows={4} className={`${campo} h-auto py-3`} {...register("bio")} />
            {erroTxt("bio")}
          </div>
          <div>
            <label htmlFor="f-insta" className={rotulo}>Instagram</label>
            <input id="f-insta" placeholder="@usuario" className={campo} {...register("instagram")} />
          </div>
          <div>
            <label htmlFor="f-linkedin" className={rotulo}>LinkedIn</label>
            <input id="f-linkedin" className={campo} {...register("linkedin")} />
          </div>
          <div>
            <label htmlFor="f-face" className={rotulo}>Facebook</label>
            <input id="f-face" className={campo} {...register("facebook")} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <span className={rotulo}>Foto</span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#DDF5EC] overflow-hidden flex items-center justify-center shrink-0">
                {fotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoPreview} alt="Pré-visualização da foto" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-[#2E5E4E]" aria-hidden="true" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                aria-label="Escolher foto"
                className="text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFotoArquivo(f);
                  if (f) setFotoPreview(URL.createObjectURL(f));
                }}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-6 rounded-2xl bg-[#2E5E4E] hover:bg-[#21463A] text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5E4E]"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {editandoId ? "Salvar alterações" : "Cadastrar associado"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limparFormulario}
              className="h-12 px-6 rounded-2xl border border-zinc-200 font-semibold hover:bg-zinc-50"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {/* ===== Lista ===== */}
      <section aria-labelledby="lista-assoc" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h2 id="lista-assoc" className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
            <Users size={22} aria-hidden="true" /> Associados ({filtrados.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative">
              <span className="sr-only">Buscar por nome, cargo ou CPF</span>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, cargo ou CPF"
                className={`${campo} pl-10 sm:w-72`}
              />
            </label>
            <label>
              <span className="sr-only">Filtrar por situação</span>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)} className={campo}>
                <option value="">Todas as situações</option>
                {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
              </select>
            </label>
          </div>
        </div>

        {carregando ? (
          <div className="bg-white rounded-3xl p-10 text-center text-zinc-500">
            <Loader2 className="animate-spin mx-auto mb-3" aria-hidden="true" /> Carregando associados...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-zinc-500">Nenhum associado encontrado.</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((a) => {
              const st = statusDe(a);
              return (
                <li key={a.id} className={`bg-white rounded-3xl border p-4 flex gap-4 ${st === "ativo" ? "border-black/5" : "border-dashed border-zinc-300 opacity-75"}`}>
                  <div className="w-16 h-16 rounded-2xl bg-[#DDF5EC] overflow-hidden shrink-0 flex items-center justify-center font-black text-[#2E5E4E] text-xl">
                    {a.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      a.nome.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-zinc-900 truncate flex items-center gap-1">
                      {a.nome}
                      {a.destaque && <Star size={14} className="text-amber-500 fill-amber-500" aria-label="Destaque" />}
                    </p>
                    <p className="text-sm text-[#2E5E4E] truncate">{a.cargo || "Sem cargo"}</p>
                    <p className="text-xs text-zinc-500">
                      {a.tipo_associado || "—"} • {STATUS.find((s) => s.valor === st)?.rotulo}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => editar(a)}
                        className="h-10 px-3 rounded-xl bg-[#DDF5EC] text-[#2E5E4E] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#c9eedf]"
                      >
                        <Pencil size={15} aria-hidden="true" /> Editar
                      </button>
                      {st === "inativo" ? (
                        <button
                          type="button"
                          onClick={() => setConfirmar({ a, novo: "ativo" })}
                          className="h-10 px-3 rounded-xl border border-zinc-200 text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-zinc-50"
                        >
                          <RotateCcw size={15} aria-hidden="true" /> Reativar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmar({ a, novo: "inativo" })}
                          className="h-10 px-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-red-100"
                        >
                          <UserMinus size={15} aria-hidden="true" /> Inativar
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
