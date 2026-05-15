export default function Footer() {
  return (
    <footer className="
      bg-black
      border-t
      border-white/5
      py-8
    ">

      <div className="
        max-w-7xl
        mx-auto
        px-6
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-4
      ">

        <p className="text-zinc-500 text-sm">
          © 2026 ACMRB • Todos os direitos reservados
        </p>

        <div className="
          flex
          items-center
          gap-6
          text-sm
          text-zinc-500
        ">

          <a href="#" className="hover:text-green-400 transition">
            Política de Privacidade
          </a>

          <a href="#" className="hover:text-green-400 transition">
            Transparência
          </a>

          <a href="#" className="hover:text-green-400 transition">
            ESG
          </a>

        </div>

      </div>

    </footer>
  );
}