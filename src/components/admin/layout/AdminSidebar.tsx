"use client";

import {
  useState,
  useEffect,
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

  /* =========================
     LOCK BODY SCROLL
  ========================= */

  useEffect(() => {

    if (mobileOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "auto";

    }

    return () => {

      document.body.style.overflow =
        "auto";

    };

  }, [mobileOpen]);

  function handleChangeSection(
    section: string,
  ) {

    setActiveSection(
      section,
    );

    setMobileOpen(
      false,
    );

  }

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
              onClick={() =>
                handleChangeSection(
                  item.label,
                )
              }
              className={`
                group
                min-h-15
                rounded-2xl
                px-5
                flex
                items-center
                justify-between
                transition-all
                duration-300
                text-left

                ${
                  active
                    ? `
                      bg-[#2E5E4E]
                      text-white
                      shadow-xl
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
                  min-w-0
                "
              >

                <Icon
                  size={21}
                  className="
                    shrink-0
                  "
                />

                <span
                  className="
                    font-semibold
                    text-[15px]
                    truncate
                  "
                >

                  {item.label}

                </span>

              </div>

              <ChevronRight
                size={18}
                className={`
                  shrink-0
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
          bg-white/95
          backdrop-blur-xl
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
            min-w-0
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
              shrink-0
            "
          >

            ♻

          </div>

          <div className="min-w-0">

            <h2
              className="
                font-black
                text-[#1F2937]
                truncate
              "
            >

              ACMRB

            </h2>

            <p
              className="
                text-xs
                text-zinc-500
                truncate
              "
            >

              Plataforma ESG

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
            hover:bg-[#E8EFEB]
            transition
            flex
            items-center
            justify-center
            shrink-0
          "
        >

          {mobileOpen
            ? <X size={22} />
            : <Menu size={22} />}

        </button>

      </div>

      {/* MOBILE SIDEBAR */}

      {mobileOpen && (

        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-50
            bg-black/40
            backdrop-blur-sm
          "
        >

          {/* OVERLAY */}

          <div
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
            className="
              absolute
              inset-0
            "
          />

          {/* SIDEBAR */}

          <aside
            className="
              relative
              w-[85%]
              max-w-85
              h-full
              bg-white
              shadow-2xl
              overflow-y-auto
              flex
              flex-col
            "
          >

            {/* HEADER */}

            <div
              className="
                p-6
                border-b
                border-black/5
                flex
                items-center
                justify-between
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
                    w-14
                    h-14
                    rounded-3xl
                    bg-linear-to-br
                    from-[#2E5E4E]
                    to-[#4F8A73]
                    flex
                    items-center
                    justify-center
                    text-white
                    text-xl
                    font-black
                  "
                >

                  ♻

                </div>

                <div>

                  <h2
                    className="
                      text-xl
                      font-black
                      text-[#111827]
                    "
                  >

                    ACMRB

                  </h2>

                  <p
                    className="
                      text-sm
                      text-zinc-500
                    "
                  >

                    Painel Admin

                  </p>

                </div>

              </div>

            </div>

            {/* MENU */}

            <div
              className="
                flex-1
                p-5
              "
            >

              {renderMenu()}

            </div>

          </aside>

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

              Sistema ESG

            </p>

            <h3
              className="
                text-lg
                font-black
                text-[#1F2937]
                mt-2
              "
            >

              Plataforma Operacional

            </h3>

            <p
              className="
                text-sm
                text-zinc-500
                leading-6
                mt-2
              "
            >

              Gestão ambiental,
              indicadores ESG,
              transparência pública
              e logística reversa.

            </p>

          </div>

        </div>

      </aside>

    </>

  );

}