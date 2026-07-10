// No topo do arquivo
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata, Viewport } from "next";
import "../styles/admin.css";
import "../styles/components.css";

export const metadata: Metadata = {
  title: {
    default: "ACMRB | Plataforma de Gestão",
    template: "%s | ACMRB",
  },
  description:
    "Plataforma institucional da Associação dos Catadores de Materiais Recicláveis de Baturité - Gestão ESG, Transparência e Logística Reversa.",
  applicationName: "ACMRB Platform",
  authors: [{ name: "ACMRB" }],
  keywords: [
    "ACMRB",
    "reciclagem",
    "Baturité",
    "ESG",
    "logística reversa",
    "catadores",
    "meio ambiente",
  ],
  icons: {
    icon: "/images/acmrb-hero.jpg",
  },
  openGraph: {
    title: "ACMRB | Plataforma de Gestão",
    description:
      "Gestão completa de materiais recicláveis, transparência e impacto social.",
    locale: "pt_BR",
    siteName: "ACMRB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534", // Verde escuro institucional
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
