/**
 * Página interna do login do ADM DEUS
 * ------------------------------------------------------------
 * Ninguém digita este endereço: o middleware leva o endereço público
 * (SLUG_ACESSO_DEUS, em src/constants/rotasAcesso.ts) para cá e responde
 * 404 para quem tentar abrir /acesso-interno-deus direto.
 */
import LoginAdmin from "@/components/auth/LoginAdmin";

export default function AcessoDeusPage() {
  return <LoginAdmin modo="deus" />;
}
