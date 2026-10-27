import "@/app/globals.css";
import "@/styles/logo.css";
import "@/styles/navigation.css";
import "@/styles/mobile-menu.css";
import "@/styles/user-menu.css";

import { AuthProvider } from "@/contexts/AuthContext";
import RastreadorVisitante from "@/components/rastreio/RastreadorVisitante";
import ExtrasVisitante from "@/components/conta/ExtrasVisitante";
import RastreadorAcessos from "@/components/rastreio/RastreadorAcessos";
import AvisoPrivacidade from "@/components/privacidade/AvisoPrivacidade";
import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/siteUrl";
import { DESCRICAO_PADRAO, IMAGEM_PADRAO, NOME_MARCA, NOME_OFICIAL, PALAVRAS_CHAVE, SIGLA, TITULO_PADRAO } from "@/lib/seo";

/**
 * Metadata global (vale para todas as páginas; cada página pode sobrescrever)
 * - metadataBase: transforma caminhos como "/quem-somos" em endereços completos
 * - verification: código do Google Search Console (variável GOOGLE_SITE_VERIFICATION)
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: TITULO_PADRAO,
    template: `%s | ${SIGLA} ${NOME_MARCA}`,
  },
  description: DESCRICAO_PADRAO,
  applicationName: `${SIGLA} ${NOME_MARCA}`,
  authors: [{ name: SIGLA }],
  creator: NOME_OFICIAL,
  publisher: NOME_OFICIAL,
  keywords: PALAVRAS_CHAVE,
  category: "Meio ambiente e reciclagem",
  formatDetection: { telephone: true, email: true, address: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: `${SIGLA} ${NOME_MARCA}`,
    title: TITULO_PADRAO,
    description: DESCRICAO_PADRAO,
    images: [IMAGEM_PADRAO],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_PADRAO,
    description: DESCRICAO_PADRAO,
    images: [IMAGEM_PADRAO.url],
  },
  // código de verificação do Google Search Console (opcional; defina na Vercel)
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#166534",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <AuthProvider>
          {children}
          {/* Atividade de visitantes logados (só para o painel do deus) */}
          <RastreadorVisitante />
          {/* Contagem anônima de visitas (todos os acessos) + aviso de privacidade (LGPD) */}
          <RastreadorAcessos />
          <AvisoPrivacidade />
          {/* Visitante logado: aviso de contato + botão flutuante de chat */}
          <ExtrasVisitante />
        </AuthProvider>
      </body>
    </html>
  );
}
