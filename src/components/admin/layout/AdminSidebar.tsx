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
  Settings,
} from "lucide-react";

const items = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
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
    value: string
  ) => void;
};

export default function AdminSidebar({
  activeSection,
  setActiveSection,
}: Props) {

  

  return (
    <aside
      className="
        w-[300px]
        min-h-screen
        bg-white
        border-r
        border-black/5
        p-6
        hidden
        lg:flex
        flex-col
      "
    >

      {/* LOGO */}

      <div
        className="
          flex
          items-center
          gap-4
          pb-8
          border-b
          border-black/5
        "
      >

        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-linear-to-br
            from-[#2E5E4E]
            to-[#4F8A73]
            flex
            items-center
            justify-center
            text-white
            font-black
            text-xl
          "
        >
          ♻
        </div>

        <div>

          <h2
            className="
              text-xl
              font-black
              text-[#1F2937]
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
            Painel Administrativo
          </p>

        </div>

      </div>

      {/* MENU */}

      <div
        className="
          flex
          flex-col
          gap-2
          mt-8
        "
      >

        {items.map((item) => {

          const Icon = item.icon;

          return (
            <button
  key={item.label}
  onClick={() =>
    setActiveSection(item.label)
  }
  className={`
    h-14
    rounded-2xl
    flex
    items-center
    gap-4
    px-5
    transition-all
    font-medium

    ${
      activeSection === item.label
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

              <Icon size={22} />

              {item.label}

            </button>
          );
        })}

      </div>

    </aside>
  );
}