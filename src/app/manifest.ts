/**
 * manifest — "ficha" do site para celulares (ícone, nome e cor)
 * Permite adicionar o site à tela inicial do celular.
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ACMRB Reciclaê – Associação de Catadores de Baturité",
    short_name: "Reciclaê",
    description: "Coleta seletiva, reciclagem e transparência em Baturité – CE.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#166534",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
