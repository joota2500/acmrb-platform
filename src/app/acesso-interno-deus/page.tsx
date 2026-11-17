/**
 * Página interna do login do ADM DEUS
 * ------------------------------------------------------------
 * Ninguém digita este endereço: o middleware leva o endereço público
 * (ROTA_SECRETA_DEUS, na env) para cá e responde
 * 404 para quem tentar abrir /acesso-interno-deus direto.
 */
import LoginAdmin from "@/components/auth/LoginAdmin";

export default function AcessoDeusPage() {
  return (
    <div data-sem-rastreio>
      <LoginAdmin modo="deus" />
    </div>
  );
}
