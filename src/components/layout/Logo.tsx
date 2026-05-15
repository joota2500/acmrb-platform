'use client'

import Logo from './Logo'

interface HeaderProps {
  onSecretClick?: () => void
}

export default function Header({
  onSecretClick
}: HeaderProps) {
  return (
    <header
      className="
        fixed top-0 left-0 w-full z-50
        bg-[#052e16]/95
        backdrop-blur-md
        border-b border-green-900
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-6 py-4
          flex items-center justify-between
        "
      >
        <Logo onSecretClick={onSecretClick} />

        <nav
          className="
            hidden lg:flex
            items-center gap-8
            text-sm text-white
          "
        >
          <a href="#" className="hover:text-green-400 transition">
            Início
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Quem Somos
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Logística Reversa
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Projetos
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Notícias
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Transparência
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Contato
          </a>
        </nav>

        <button
          className="
            hidden md:flex
            bg-green-600 hover:bg-green-500
            text-white
            px-5 py-3
            rounded-full
            text-sm font-medium
            transition
          "
        >
          Seja Parceiro
        </button>
      </div>
    </header>
  )
}