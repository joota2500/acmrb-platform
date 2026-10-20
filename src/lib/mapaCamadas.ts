/**
 * Camadas de fundo do mapa (Leaflet) — todas gratuitas e sem chave
 * ------------------------------------------------------------
 *  - "mapa":     CARTO Voyager (dados © OpenStreetMap), ruas legíveis
 *  - "satelite": Esri World Imagery (imagem de satélite, até zoom ~19)
 *  - "hibrido":  satélite + rótulos/limites da Esri (Reference)
 * Adiciona o controle de troca (canto superior direito) e lembra a
 * última camada escolhida no localStorage (chave por contexto).
 * Só use no navegador (importa Leaflet).
 */

import L from "leaflet";

export type CamadaId = "mapa" | "satelite" | "hibrido";

export const ROTULO_CAMADA: Record<CamadaId, string> = {
  mapa: "Mapa",
  satelite: "Satélite",
  hibrido: "Híbrido",
};

const ATR_OSM = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
// NÃO UTILIZADO: atribuição do CARTO (camada substituída pelo OSM)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ATR_CARTO = `${ATR_OSM} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>`;
const ATR_ESRI =
  'Imagens &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics e comunidade de usuários GIS';

const URL_ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const URL_ESRI_ROTULOS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

/** Zoom máximo comum às camadas (satélite tem boa imagem até ~19) */
export const ZOOM_MAXIMO = 19;

function criar(id: CamadaId): L.Layer {
  const satelite = () =>
    L.tileLayer(URL_ESRI_IMG, { maxZoom: ZOOM_MAXIMO, maxNativeZoom: 19, attribution: ATR_ESRI });
  if (id === "mapa") {
    // OpenStreetMap padrão (gratuito, sem chave). O CARTO passou a exigir chave de API.
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: ZOOM_MAXIMO,
      maxNativeZoom: 19,
      attribution: ATR_OSM,
    });
  }
  if (id === "satelite") return satelite();
  // híbrido: imagem + nomes de lugares/limites por cima
  return L.layerGroup([
    satelite(),
    L.tileLayer(URL_ESRI_ROTULOS, { maxZoom: ZOOM_MAXIMO, maxNativeZoom: 19, attribution: "Rótulos &copy; Esri" }),
  ]);
}

function lerSalva(chave: string): CamadaId | null {
  try {
    const v = window.localStorage.getItem(chave);
    return v === "mapa" || v === "satelite" || v === "hibrido" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Adiciona as 3 camadas e o controle de troca ao mapa.
 * @param chave chave do localStorage (ex.: "acmrb-mapa-camada-publico")
 * @param padrao camada usada quando não há escolha salva
 */
export function adicionarCamadas(mapa: L.Map, chave: string, padrao: CamadaId = "mapa") {
  const camadas: Record<CamadaId, L.Layer> = { mapa: criar("mapa"), satelite: criar("satelite"), hibrido: criar("hibrido") };
  const inicial = lerSalva(chave) ?? padrao;
  camadas[inicial].addTo(mapa);

  const porRotulo: Record<string, L.Layer> = {};
  (Object.keys(camadas) as CamadaId[]).forEach((id) => (porRotulo[ROTULO_CAMADA[id]] = camadas[id]));
  L.control.layers(porRotulo, undefined, { position: "topright", collapsed: false }).addTo(mapa);

  // Lembra a escolha do visitante/admin
  mapa.on("baselayerchange", (e: L.LayersControlEvent) => {
    const id = (Object.keys(ROTULO_CAMADA) as CamadaId[]).find((k) => ROTULO_CAMADA[k] === e.name);
    if (!id) return;
    try {
      window.localStorage.setItem(chave, id);
    } catch {
      /* modo privado: ignora */
    }
  });
  return camadas;
}
