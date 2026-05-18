"use client";

import {
  useState,
} from "react";

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
  PackageSearch,
  Menu,
  X,
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
    icon: PackageSearch,
    label: "Materiais",
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

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  function renderMenu() {

    return (

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
              onClick={() => {

                setActiveSection(
                  item.label,
                );

                setMobileOpen(
                  false,
                );

              }}
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

    );

  }

  return (

    <>

      {/* MOBILE TOPBAR */}

      <div
        className="
          lg:hidden
          sticky
          top-0
          z-50
          bg-white
          border-b
          border-black/5
          px-5
          py-4
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-linear-to-br
              from-[#2E5E4E]
              to-[#4F8A73]
              flex
              items-center
              justify-center
              text-white
              font-black
            "
          >

            ♻

          </div>

          <div>

            <h2
              className="
                font-black
                text-[#1F2937]
              "
            >

              ACMRB

            </h2>

            <p
              className="
                text-xs
                text-zinc-500
              "
            >

              Painel ESG

            </p>

          </div>

        </div>

        <button
          onClick={() =>
            setMobileOpen(
              !mobileOpen,
            )
          }
          className="
            w-12
            h-12
            rounded-2xl
            bg-[#F3F6F4]
            flex
            items-center
            justify-center
          "
        >

          {mobileOpen
            ? <X size={22} />
            : <Menu size={22} />}

        </button>

      </div>

      {/* MOBILE MENU */}

      {mobileOpen && (

        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-sm
          "
        >

          <div
            className="
              absolute
              left-0
              top-0
              h-full
              w-80
              bg-white
              p-5
              overflow-y-auto
            "
          >

            {renderMenu()}

          </div>

        </div>

      )}

      {/* DESKTOP SIDEBAR */}

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
                "
              >

                ACMRB

              </h1>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
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

          {renderMenu()}

        </div>

      </aside>

    </>

  );

}