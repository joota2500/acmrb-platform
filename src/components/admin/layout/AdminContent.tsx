/**
 * AdminContent — área de conteúdo das seções
 * ------------------------------------------------------------
 * Largura máxima confortável e espaçamento por tela:
 * celular 16px, tablet 24px, desktop 32–40px. No celular reserva espaço
 * embaixo para a barra de navegação rápida (AdminBottomNav).
 */

type Props = {
  children: React.ReactNode;
};

export default function AdminContent({ children }: Props) {
  return (
    <main id="conteudo-admin" className="admin-main" tabIndex={-1}>
      <div className="admin-main__inner">{children}</div>
    </main>
  );
}
