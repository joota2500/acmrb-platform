/**
 * Dados de contato institucionais da ACMRB (fonte única)
 * ------------------------------------------------------------
 * Usado por ContactSection, InstitutionalSection e Footer.
 * Altere aqui para refletir em todo o site.
 */

export const CONTATO = {
  whatsappExibicao: "(85) 98921-4864",
  /** Número no formato internacional, só dígitos (wa.me / tel:) */
  whatsappNumero: "5585989214864",
  instagramUsuario: "reciclaae",
  email: "reciclae25@gmail.com",
  cnpj: "62.166.052/0001-90",
  endereco: "Rua Kaolim, 252 – Manga, Baturité/CE",
  /** Endereço em texto simples para buscas no Google Maps */
  enderecoBusca: "Rua Kaolim, 252, Manga, Baturité, CE",
  fundacao: "10/07/2025",
} as const;

/**
 * Coordenada da sede no mapa institucional.
 * ATENÇÃO: valor aproximado (nível do bairro Manga, obtido pela busca de
 * endereço). Para ajustar, abra o Google Maps no local exato, clique com o
 * botão direito e copie "latitude, longitude" para cá.
 */
export const SEDE_COORDENADA: [number, number] = [-4.346242, -38.878247];
export const SEDE_COORDENADA_APROXIMADA = true;

export const linkWhatsApp = (mensagem?: string) =>
  `https://wa.me/${CONTATO.whatsappNumero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;

export const linkTelefone = () => `tel:+${CONTATO.whatsappNumero}`;

export const linkInstagram = () => `https://www.instagram.com/${CONTATO.instagramUsuario}/`;

export const linkEmail = (assunto?: string, corpo?: string) => {
  const params: string[] = [];
  if (assunto) params.push(`subject=${encodeURIComponent(assunto)}`);
  if (corpo) params.push(`body=${encodeURIComponent(corpo)}`);
  return `mailto:${CONTATO.email}${params.length ? `?${params.join("&")}` : ""}`;
};

export const linkMapaBusca = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTATO.enderecoBusca)}`;

export const linkComoChegar = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTATO.enderecoBusca)}`;
