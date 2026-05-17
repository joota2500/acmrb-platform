"use client";

import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Handshake,
  FolderKanban,
  Leaf,
  CalendarDays,
  FileText,
  Newspaper,
  Settings,
  ChevronRight,
} from "lucide-react";

const items = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    icon: Newspaper,
    label: "Notícias",
  },
  {
    icon: Users,
    label: "Associados",
  },
  {
    icon: ShieldAlert,
    label: "Denúncias",
  },
  {
    icon: Handshake,
    label: "Parceiros",
  },
  {
    icon: FolderKanban,
    label: "Projetos",
  },
  {
    icon: Leaf,
    label: "Indicadores ESG",
  },
  {
    icon: CalendarDays,
    label: "Coletas",
  },
  {
    icon: FileText,
    label: "Relatórios",
  },
  {
    icon: Settings,
    label: "Configurações",
  },
];

type Props = {
  activeSection: string;

  setActiveSection: (
    value: string,
  ) => void;
};

export default function AdminSidebar({
  activeSection,
  setActiveSection,
}: Props) {

  return (

    <aside
      className="
        hidden
        lg:flex
        flex-col
        w-80
        min-h-screen
        bg-white
        border-r
        border-black/5
        sticky
        top-0
      "
    >

      {/* HEADER */}

      <div
        className="
          px-7
          py-8
          border-b
          border-black/5
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-15
              h-15
              rounded-3xl
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#4F8A73]
              flex
              items-center
              justify-center
              text-white
              text-2xl
              shadow-lg
            "
          >

            ♻

          </div>

          <div>

            <h1
              className="
                text-2xl
                font-black
                text-[#1F2937]
                leading-none
              "
            >

              ACMRB

            </h1>

            <p
              className="
                text-sm
                text-zinc-500
                mt-2
              "
            >

              Painel Administrativo

            </p>

          </div>

        </div>

      </div>

      {/* MENU */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          py-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          {items.map((item) => {

            const Icon =
              item.icon;

            const active =
              activeSection ===
              item.label;

            return (

              <button
                key={item.label}
                onClick={() =>
                  setActiveSection(
                    item.label,
                  )
                }
                className={`
                  group
                  h-15
                  rounded-2xl
                  px-5
                  flex
                  items-center
                  justify-between
                  transition-all
                  duration-300

                  ${
                    active
                      ? `
                        bg-[#2E5E4E]
                        text-white
                        shadow-lg
                        shadow-emerald-900/10
                      `
                      : `
                        text-[#374151]
                        hover:bg-[#F3F6F4]
                        hover:text-[#2E5E4E]
                      `
                  }
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <Icon size={21} />

                  <span
                    className="
                      font-semibold
                      text-[15px]
                    "
                  >

                    {item.label}

                  </span>

                </div>

                <ChevronRight
                  size={18}
                  className={`
                    transition-all

                    ${
                      active
                        ? `
                          opacity-100
                          translate-x-0
                        `
                        : `
                          opacity-0
                          -translate-x-2
                          group-hover:opacity-100
                          group-hover:translate-x-0
                        `
                    }
                  `}
                />

              </button>

            );

          })}

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          p-5
          border-t
          border-black/5
        "
      >

        <div
          className="
            rounded-3xl
            bg-[#F7FAF8]
            border
            border-black/5
            p-5
          "
        >

          <p
            className="
              text-xs
              uppercase
              tracking-wider
              text-zinc-400
              font-bold
            "
          >

            Sistema

          </p>

          <h3
            className="
              text-lg
              font-black
              text-[#1F2937]
              mt-2
            "
          >

            Plataforma ESG

          </h3>

          <p
            className="
              text-sm
              text-zinc-500
              leading-6
              mt-2
            "
          >

            Gestão institucional,
            impacto ambiental
            e transparência pública.

          </p>

        </div>

      </div>

    </aside>

  );

}