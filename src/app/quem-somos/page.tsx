"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Recycle,
  Users,
  HeartHandshake,
  Globe,
  PlayCircle,
  ShieldCheck,
  Building2,
  Leaf,
  Award,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Associado = {
  id: string;
  nome: string;
  cargo: string;
  tipo_associado: string;
  foto_url?: string;
  bio?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  ativo?: boolean;
  destaque?: boolean;
};

export default function QuemSomosPage() {

  const [associados, setAssociados] =
    useState<Associado[]>([]);

  const [totalAssociados, setTotalAssociados] =
    useState(0);

  async function carregarAssociados() {

    const { data } =
      await supabase
        .from("associados")
        .select("*")
        .eq("ativo", true)
        .order("destaque", {
          ascending: false,
        })
        .limit(4);

    setAssociados(
      (data as Associado[]) || [],
    );

    const { count } =
      await supabase
        .from("associados")
        .select("*", {
          count: "exact",
          head: true,
        });

    setTotalAssociados(count || 0);

  }

  useEffect(() => {

    carregarAssociados();

  }, []);

  return (

    <main className="bg-[#F4F7F3] overflow-hidden">

      {/* HERO */}

      <section
        className="
          relative
          pt-28
          pb-24
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-linear-to-b
            from-[#DDF5EC]
            to-transparent
            opacity-70
          "
        />

        <div
          className="
            relative
            max-w-7xl
            mx-auto
            px-5
          "
        >

          {/* VOLTAR */}

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-3
              h-12
              px-5
              rounded-2xl
              bg-white
              border
              border-black/5
              shadow-sm
              hover:shadow-md
              transition
              text-[#111827]
              font-semibold
            "
          >

            <ArrowLeft size={18} />

            Voltar para início

          </Link>

          {/* HERO */}

          <div
            className="
              mt-8
              bg-white
              rounded-[42px]
              overflow-hidden
              border
              border-black/5
              shadow-2xl
            "
          >

            <div
              className="
                grid
                xl:grid-cols-2
              "
            >

              {/* TEXTO */}

              <div
                className="
                  p-8
                  md:p-14
                  xl:p-16
                "
              >

                <div
                  className="
                    inline-flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    rounded-full
                    bg-[#DDF5EC]
                    text-[#2E5E4E]
                    font-bold
                    text-sm
                  "
                >

                  <Recycle size={18} />

                  Associação Reciclaê • ACMRB

                </div>

                <h1
                  className="
                    mt-8
                    text-5xl
                    md:text-6xl
                    font-black
                    leading-[1.05]
                    text-[#111827]
                  "
                >
                  Transformando vidas através da
                  reciclagem, dignidade e inclusão
                  social.
                </h1>

                <p
                  className="
                    mt-8
                    text-lg
                    md:text-xl
                    leading-9
                    text-zinc-600
                  "
                >
                  A Associação dos Catadores de
                  Materiais Recicláveis de
                  Baturité nasceu da luta diária de
                  trabalhadores que sobreviveram
                  durante anos em condições
                  extremamente difíceis no antigo
                  lixão municipal.
                </p>

                <p
                  className="
                    mt-6
                    text-lg
                    leading-9
                    text-zinc-600
                  "
                >
                  Hoje a ACMRB representa uma nova
                  oportunidade para dezenas de
                  famílias que buscam renda,
                  reconhecimento, estrutura,
                  inclusão social e valorização do
                  trabalho ambiental.
                </p>

                {/* STATS */}

                <div
                  className="
                    grid
                    grid-cols-2
                    md:grid-cols-4
                    gap-4
                    mt-10
                  "
                >

                  <div
                    className="
                      bg-[#F5F7F4]
                      rounded-3xl
                      p-5
                    "
                  >

                    <Users
                      size={28}
                      className="text-[#2E5E4E]"
                    />

                    <h3
                      className="
                        mt-4
                        text-3xl
                        font-black
                        text-[#111827]
                      "
                    >
                      {totalAssociados}+
                    </h3>

                    <p className="text-zinc-500 mt-1 text-sm">
                      Associados
                    </p>

                  </div>

                  <div
                    className="
                      bg-[#F5F7F4]
                      rounded-3xl
                      p-5
                    "
                  >

                    <HeartHandshake
                      size={28}
                      className="text-[#2E5E4E]"
                    />

                    <h3
                      className="
                        mt-4
                        text-3xl
                        font-black
                        text-[#111827]
                      "
                    >
                      30+
                    </h3>

                    <p className="text-zinc-500 mt-1 text-sm">
                      Famílias impactadas
                    </p>

                  </div>

                  <div
                    className="
                      bg-[#F5F7F4]
                      rounded-3xl
                      p-5
                    "
                  >

                    <Recycle
                      size={28}
                      className="text-[#2E5E4E]"
                    />

                    <h3
                      className="
                        mt-4
                        text-3xl
                        font-black
                        text-[#111827]
                      "
                    >
                      ESG
                    </h3>

                    <p className="text-zinc-500 mt-1 text-sm">
                      Sustentabilidade
                    </p>

                  </div>

                  <div
                    className="
                      bg-[#F5F7F4]
                      rounded-3xl
                      p-5
                    "
                  >

                    <Leaf
                      size={28}
                      className="text-[#2E5E4E]"
                    />

                    <h3
                      className="
                        mt-4
                        text-3xl
                        font-black
                        text-[#111827]
                      "
                    >
                      2025
                    </h3>

                    <p className="text-zinc-500 mt-1 text-sm">
                      Fundação
                    </p>

                  </div>

                </div>

                {/* BOTÕES */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-4
                    mt-10
                  "
                >

                  <a
                    href="#associados"
                    className="
                      h-14
                      px-8
                      rounded-2xl
                      bg-[#2E5E4E]
                      hover:bg-[#21463A]
                      transition
                      text-white
                      font-bold
                      inline-flex
                      items-center
                      gap-3
                    "
                  >

                    Conhecer associados

                    <ArrowRight size={18} />

                  </a>

                  <Link
                    href="/parcerias"
                    className="
                      h-14
                      px-8
                      rounded-2xl
                      bg-zinc-100
                      hover:bg-zinc-200
                      transition
                      text-[#111827]
                      font-bold
                      inline-flex
                      items-center
                    "
                  >
                    Seja parceiro
                  </Link>

                </div>

              </div>

              {/* IMAGEM */}

              <div className="relative min-h-175">

                <Image
                  src="/images/acmrb-hero.jpg"
                  alt="ACMRB"
                  fill
                  className="object-cover"
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-linear-to-t
                    from-black/70
                    via-black/20
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    bottom-10
                    left-10
                    right-10
                    bg-white/10
                    backdrop-blur-md
                    border
                    border-white/20
                    rounded-3xl
                    p-6
                    text-white
                  "
                >

                  <p
                    className="
                      text-2xl
                      font-black
                      leading-tight
                    "
                  >
                    “A reciclagem mudou não apenas
                    o meio ambiente, mas também a
                    história de dezenas de famílias
                    em Baturité.”
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* TRAJETÓRIA */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-5
          pb-24
        "
      >

        <div className="mb-14">

          <span
            className="
              text-[#2E5E4E]
              font-bold
            "
          >
            Nossa trajetória
          </span>

          <h2
            className="
              mt-4
              text-5xl
              font-black
              text-[#111827]
            "
          >
            Uma história construída pela luta.
          </h2>

        </div>

        <div
          className="
            grid
            xl:grid-cols-3
            gap-8
          "
        >

          {/* CARD 1 */}

          <div
            className="
              bg-white
              rounded-[36px]
              overflow-hidden
              border
              border-black/5
            "
          >

            <div className="relative h-72">

              <Image
                src="/images/lixao.jpg"
                alt="Lixão"
                fill
                className="object-cover"
              />

            </div>

            <div className="p-8">

              <h3
                className="
                  text-3xl
                  font-black
                  text-[#111827]
                "
              >
                Antes da associação
              </h3>

              <p
                className="
                  mt-5
                  text-zinc-600
                  leading-8
                  text-lg
                "
              >
                Muitos trabalhadores passavam
                diariamente horas sob o sol no
                antigo lixão de Baturité,
                enfrentando condições precárias,
                riscos ambientais e ausência de
                estrutura adequada.
              </p>

            </div>

          </div>

          {/* CARD 2 */}

          <div
            className="
              bg-[#2E5E4E]
              text-white
              rounded-[36px]
              p-10
            "
          >

            <Building2 size={44} />

            <h3
              className="
                mt-8
                text-4xl
                font-black
              "
            >
              Organização e união
            </h3>

            <p
              className="
                mt-6
                leading-9
                text-lg
                opacity-90
              "
            >
              Com apoio institucional da
              Secretaria de Meio Ambiente,
              Autarquia Municipal e parceiros,
              nasceu a ACMRB, iniciando uma nova
              etapa de inclusão social,
              valorização humana e fortalecimento
              ambiental.
            </p>

          </div>

          {/* CARD 3 */}

          <div
            className="
              bg-white
              rounded-[36px]
              overflow-hidden
              border
              border-black/5
            "
          >

            <div className="relative h-72">

              <Image
                src="/images/reciclagem.jpg"
                alt="Reciclagem"
                fill
                className="object-cover"
              />

            </div>

            <div className="p-8">

              <h3
                className="
                  text-3xl
                  font-black
                  text-[#111827]
                "
              >
                Futuro sustentável
              </h3>

              <p
                className="
                  mt-5
                  text-zinc-600
                  leading-8
                  text-lg
                "
              >
                A associação continua buscando
                novas oportunidades, projetos,
                capacitações e parcerias ESG para
                ampliar renda, estrutura e impacto
                ambiental positivo na região.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ASSOCIADOS */}

      <section
        id="associados"
        className="
          max-w-7xl
          mx-auto
          px-5
          pb-24
        "
      >

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-6
            mb-12
          "
        >

          <div>

            <span
              className="
                text-[#2E5E4E]
                font-bold
              "
            >
              Associados
            </span>

            <h2
              className="
                mt-4
                text-5xl
                font-black
                text-[#111827]
              "
            >
              Pessoas que fazem a diferença todos
              os dias.
            </h2>

          </div>

          <Link
            href="/associados"
            className="
              h-14
              px-8
              rounded-2xl
              bg-[#2E5E4E]
              hover:bg-[#21463A]
              transition
              text-white
              font-bold
              inline-flex
              items-center
              gap-3
            "
          >

            Ver todos

            <ArrowRight size={18} />

          </Link>

        </div>

        <div
          className="
            grid
            md:grid-cols-2
            xl:grid-cols-4
            gap-6
          "
        >

          {associados.map((item) => (

            <div
              key={item.id}
              className="
                bg-white
                rounded-[36px]
                overflow-hidden
                border
                border-black/5
                shadow-sm
                hover:-translate-y-1
                hover:shadow-xl
                transition
              "
            >

              <div className="relative h-80">

                <img
                  src={item.foto_url}
                  alt={item.nome}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              </div>

              <div className="p-6">

                <h3
                  className="
                    text-2xl
                    font-black
                    text-[#111827]
                  "
                >
                  {item.nome}
                </h3>

                <p
                  className="
                    mt-2
                    text-[#2E5E4E]
                    font-semibold
                  "
                >
                  {item.cargo}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-zinc-500
                  "
                >
                  {item.tipo_associado}
                </p>

                {item.bio && (

                  <p
                    className="
                      mt-5
                      text-zinc-600
                      leading-7
                      line-clamp-4
                    "
                  >
                    {item.bio}
                  </p>

                )}

                <div
                  className="
                    mt-6
                    space-y-2
                    text-sm
                    text-zinc-500
                  "
                >

                  {item.telefone && (
                    <p>
                      📞 {item.telefone}
                    </p>
                  )}

                  {item.email && (
                    <p>
                      ✉️ {item.email}
                    </p>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* PARCERIAS */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-5
          pb-24
        "
      >

        <div
          className="
            bg-[#111827]
            rounded-[42px]
            p-10
            md:p-16
            text-white
          "
        >

          <Award size={48} />

          <h2
            className="
              mt-8
              text-5xl
              font-black
              leading-tight
            "
          >
            A ACMRB continua buscando apoio,
            parcerias e novas oportunidades.
          </h2>

          <p
            className="
              mt-8
              text-xl
              leading-9
              text-zinc-300
              max-w-4xl
            "
          >
            Empresas, instituições, projetos ESG,
            universidades e parceiros ambientais
            podem contribuir diretamente para o
            fortalecimento da associação,
            melhoria da estrutura operacional,
            capacitação dos trabalhadores e
            ampliação do impacto ambiental
            positivo em Baturité.
          </p>

          <div className="mt-10">

            <Link
              href="/parcerias"
              className="
                h-14
                px-8
                rounded-2xl
                bg-white
                text-[#111827]
                font-bold
                inline-flex
                items-center
                gap-3
              "
            >

              Tornar-se parceiro

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </section>

      {/* VIDEO */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-5
          pb-24
        "
      >

        <div
          className="
            bg-white
            rounded-[42px]
            overflow-hidden
            border
            border-black/5
          "
        >

          <div className="p-8 md:p-14">

            <span
              className="
                text-[#2E5E4E]
                font-bold
              "
            >
              Vídeo institucional
            </span>

            <h2
              className="
                mt-4
                text-5xl
                font-black
                text-[#111827]
              "
            >
              Conheça mais sobre a ACMRB.
            </h2>

          </div>

          <div className="aspect-video">

            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/ITur0JNJZos"
              title="Vídeo ACMRB"
              allowFullScreen
            />

          </div>

        </div>

      </section>

      {/* INSTAGRAM */}

<section
  className="
    max-w-7xl
    mx-auto
    px-5
    pb-24
  "
>

  <div
    className="
      flex
      flex-col
      md:flex-row
      md:items-end
      md:justify-between
      gap-6
      mb-12
    "
  >

    <div>

      <span
        className="
          text-[#2E5E4E]
          font-bold
        "
      >
        Instagram
      </span>

      <h2
        className="
          mt-4
          text-4xl
          font-black
          text-[#111827]
        "
      >
        Acompanhe nossas ações ambientais.
      </h2>

      <p
        className="
          mt-4
          text-zinc-600
          text-lg
          leading-8
          max-w-2xl
        "
      >
        Projetos, ações ambientais,
        educação ecológica, coleta seletiva
        e a transformação social construída
        diariamente pelos associados da ACMRB.
      </p>

    </div>

    <a
      href="https://instagram.com"
      target="_blank"
      className="
        h-14
        px-8
        rounded-2xl
        bg-[#111827]
        hover:bg-black
        transition
        text-white
        font-bold
        inline-flex
        items-center
        gap-3
      "
    >

      <Globe size={20} />

      Ver Instagram

    </a>

  </div>

  <div
    className="
      grid
      md:grid-cols-3
      gap-6
    "
  >

    <iframe
      src="https://www.instagram.com/p/DYcEwegMSmg/embed"
      className="
        w-full
        min-h-150
        rounded-3xl
        bg-white
      "
    />

    <iframe
      src="https://www.instagram.com/reel/DX4O5DgtuE3/embed"
      className="
        w-full
        min-h-150
        rounded-3xl
        bg-white
      "
    />

    <iframe
      src="https://www.instagram.com/p/DW90q-MF38J/embed"
      className="
        w-full
        min-h-150
        rounded-3xl
        bg-white
      "
    />

  </div>

</section>

      {/* FOOTER */}

      <footer
        className="
          bg-[#111827]
          text-white
          pt-20
          pb-10
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-5
          "
        >

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
              gap-12
              pb-16
              border-b
              border-white/10
            "
          >

            <div>

              <h3
                className="
                  text-3xl
                  font-black
                "
              >
                ACMRB
              </h3>

              <p
                className="
                  mt-5
                  text-zinc-400
                  leading-8
                "
              >
                Associação dos Catadores de
                Materiais Recicláveis de Baturité.
              </p>

            </div>

            <div>

              <h4
                className="
                  font-bold
                  text-xl
                "
              >
                Institucional
              </h4>

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  gap-4
                  text-zinc-400
                "
              >

                <Link href="/">
                  Início
                </Link>

                <Link href="/quem-somos">
                  Quem somos
                </Link>

                <Link href="/associados">
                  Associados
                </Link>

                <Link href="/parcerias">
                  Parcerias
                </Link>

              </div>

            </div>

            <div>

              <h4
                className="
                  font-bold
                  text-xl
                "
              >
                Contato
              </h4>

              <div
                className="
                  mt-5
                  space-y-4
                  text-zinc-400
                "
              >

                <p className="flex gap-3">
                  <Phone size={18} />
                  Baturité • Ceará
                </p>

                <p className="flex gap-3">
                  <Mail size={18} />
                  contato@acmrb.org
                </p>

              </div>

            </div>

            <div>

              <h4
                className="
                  font-bold
                  text-xl
                "
              >
                ESG e sustentabilidade
              </h4>

              <p
                className="
                  mt-5
                  text-zinc-400
                  leading-8
                "
              >
                Projeto institucional voltado para
                inclusão social, reciclagem,
                impacto ambiental e fortalecimento
                comunitário.
              </p>

            </div>

          </div>

          <div
            className="
              pt-8
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
              text-sm
              text-zinc-500
            "
          >

            <p>
              © 2026 ACMRB • Todos os direitos
              reservados.
            </p>

            <p>
              Plataforma ESG • Reciclaê
            </p>

          </div>

        </div>

      </footer>

    </main>

  );

}