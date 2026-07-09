import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "ACMRB | Plataforma ESG e Reciclagem",
    template: "%s | ACMRB",
  },
  description:
    "Plataforma institucional da ACMRB para gestão de materiais recicláveis, transparência ESG, logística reversa e impacto social em Baturité.",
  applicationName: "ACMRB Platform",
  authors: [{ name: "ACMRB" }],
  keywords: [
    "ACMRB",
    "reciclagem",
    "Baturité",
    "ESG",
    "logística reversa",
    "coleta seletiva",
    "materiais recicláveis",
  ],
  openGraph: {
    title: "ACMRB | Plataforma ESG e Reciclagem",
    description:
      "Gestão de materiais recicláveis, transparência ESG e impacto social em Baturité.",
    locale: "pt_BR",
    siteName: "ACMRB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
 
  return (
    <html lang="pt-BR">

      <body>

        <AuthProvider>
          {children}
        </AuthProvider>

      </body>

    </html>
  );
}
