/**
 * /admin/login — entrada dos administradores (admin ou deus)
 * Nenhuma página do site tem link para cá. Quem abrir /admin sem
 * estar logado é enviado para esta tela.
 */
import LoginAdmin from "@/components/auth/LoginAdmin";

export default function AdminLoginPage() {
  return (
    <div data-sem-rastreio>
      <LoginAdmin modo="admin" />
    </div>
  );
}
