/**
 * AdminContainer — moldura do painel
 * ------------------------------------------------------------
 * Fundo e reserva de espaço para a barra lateral fixa no desktop.
 * A largura da reserva acompanha a barra (larga 260px / recolhida 80px)
 * pela classe .admin-shell--recolhida (src/styles/admin-shell.css).
 */

import "@/styles/admin-shell.css";

type Props = {
  children: React.ReactNode;
  recolhida?: boolean;
};

export default function AdminContainer({ children, recolhida = false }: Props) {
  return (
    <div className={`admin-shell ${recolhida ? "admin-shell--recolhida" : ""}`}>
      {children}
    </div>
  );
}
