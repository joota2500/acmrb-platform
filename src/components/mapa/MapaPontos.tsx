"use client";

/**
 * MapaPontos — mapa Leaflet com marcadores coloridos
 * Camadas Mapa (CARTO/OSM), Satélite e Híbrido (Esri) — src/lib/mapaCamadas.ts
 * ------------------------------------------------------------
 * Só roda no navegador: carregue SEMPRE com next/dynamic({ ssr: false }).
 * - Não captura a rolagem da página: zoom pela roda desligado e, em
 *   telas de toque, o arrasto só liga depois de tocar em "Ativar mapa".
 * - Marcadores são divIcon (sem imagens externas), com a cor da categoria.
 * - Popups montados com texto escapado (sem HTML vindo do banco).
 * - "selecionado" centraliza e abre o popup (usado pela lista acessível).
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/mapa.css";
import { cartaoPopup, linkRotaGoogle, linkWhatsapp } from "@/lib/mapaPopup";
import { adicionarCamadas, ZOOM_MAXIMO, opcoesPopup } from "@/lib/mapaCamadas";
import { BATURITE_CENTRO, BATURITE_ZOOM, corCategoria, linkExterno, linkInstagram, type ApoiadorPublico } from "@/lib/apoiadores";

interface Props {
  pontos: ApoiadorPublico[];
  selecionado?: string | null;
  onSelecionar?: (id: string) => void;
  rotulo?: string;
}

/** Ícone redondo com a cor da categoria */
export function iconeCategoria(categoria: string, destaque = false) {
  const cor = corCategoria(categoria);
  return L.divIcon({
    className: "mapa-pin",
    html: `<span class="mapa-pin__gota${destaque ? " mapa-pin__gota--ativo" : ""}" style="--pin:${cor}"><span class="mapa-pin__ponto"></span></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

function popupHtml(p: ApoiadorPublico) {
  // Cartão compacto compartilhado (src/lib/mapaPopup.ts)
  return cartaoPopup({
    nome: p.nome_exibicao,
    categoria: p.categoria,
    cor: corCategoria(p.categoria),
    logoUrl: p.logo_url,
    info: [p.tipos_apoio.slice(0, 2).join(", "), p.bairro],
    descricao: p.descricao,
    nota: p.localizacao_aproximada ? "Localização aproximada" : null,
    acoes: [
      (() => { const h = linkWhatsapp(p.telefone_publico); return h ? { tipo: "whatsapp" as const, href: h } : null; })(),
      p.instagram ? { tipo: "instagram" as const, href: linkInstagram(p.instagram)! } : null,
      !p.localizacao_aproximada && linkRotaGoogle(p.latitude, p.longitude) ? { tipo: "rota" as const, href: linkRotaGoogle(p.latitude, p.longitude)! } : null,
      !p.instagram && linkExterno(p.site) ? { tipo: "site" as const, href: linkExterno(p.site)! } : null,
    ],
  });
}

export default function MapaPontos({ pontos, selecionado, onSelecionar, rotulo = "Mapa de apoiadores em Baturité" }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadaRef = useRef<L.LayerGroup | null>(null);
  const marcadoresRef = useRef<Map<string, L.Marker>>(new Map());
  const [toque] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const [ativo, setAtivo] = useState(!toque);

  // Cria o mapa uma única vez
  useEffect(() => {
    if (!divRef.current || mapaRef.current) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mapa = L.map(divRef.current, {
      center: BATURITE_CENTRO,
      zoom: BATURITE_ZOOM,
      maxZoom: ZOOM_MAXIMO,
      scrollWheelZoom: false,
      dragging: !toque,
      touchZoom: !toque,
      zoomAnimation: !reduzir,
      fadeAnimation: !reduzir,
      markerZoomAnimation: !reduzir,
    });
    // Mapa / Satélite / Híbrido (lembra a última escolha do visitante)
    adicionarCamadas(mapa, "acmrb-mapa-camada-publico", "mapa");
    camadaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    // Recalcula o tamanho sempre que o contêiner mudar (altura em dvh,
    // rotação do celular, grid que muda de colunas). Sem isso o Leaflet
    // pode ficar com tamanho 0 e não desenhar mapa nem marcadores.
    const obs = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => mapa.invalidateSize()) : null;
    obs?.observe(divRef.current);
    const t = window.setTimeout(() => mapa.invalidateSize(), 300);
    return () => {
      obs?.disconnect();
      window.clearTimeout(t);
      mapa.remove();
      mapaRef.current = null;
    };
  }, [toque]);

  // Liga o arrasto depois que o visitante ativa o mapa (telas de toque)
  useEffect(() => {
    const m = mapaRef.current;
    if (!m) return;
    if (ativo) {
      m.dragging.enable();
      m.touchZoom.enable();
    }
  }, [ativo]);

  // Atualiza os marcadores quando a lista (filtrada) muda
  useEffect(() => {
    const mapa = mapaRef.current;
    const camada = camadaRef.current;
    if (!mapa || !camada) return;
    camada.clearLayers();
    marcadoresRef.current.clear();
    const com = pontos.filter((p) => p.no_mapa && p.latitude != null && p.longitude != null);
    com.forEach((p) => {
      const mk = L.marker([p.latitude!, p.longitude!], {
        icon: iconeCategoria(p.categoria),
        title: p.nome_exibicao,
        alt: `${p.nome_exibicao} – ${p.categoria}`,
        keyboard: true,
      })
        .bindPopup(popupHtml(p), opcoesPopup())
        .on("click", () => onSelecionar?.(p.id));
      mk.addTo(camada);
      marcadoresRef.current.set(p.id, mk);
    });
    if (com.length > 1) {
      mapa.fitBounds(L.latLngBounds(com.map((p) => [p.latitude!, p.longitude!] as [number, number])), { padding: [40, 40], maxZoom: 16 });
    } else if (com.length === 1) {
      mapa.setView([com[0].latitude!, com[0].longitude!], 16);
    }
  }, [pontos, onSelecionar]);

  // Seleção vinda da lista: centraliza e abre o popup
  useEffect(() => {
    if (!selecionado) return;
    const mk = marcadoresRef.current.get(selecionado);
    const mapa = mapaRef.current;
    if (mk && mapa) {
      mapa.setView(mk.getLatLng(), Math.max(mapa.getZoom(), 16));
      mk.openPopup();
    }
  }, [selecionado]);

  return (
    <div className="mapa-wrap">
      <div ref={divRef} className="mapa-canvas" role="region" aria-label={rotulo} />
      {!ativo && (
        <button type="button" className="mapa-ativar" onClick={() => setAtivo(true)}>
          Toque para mover o mapa
        </button>
      )}
    </div>
  );
}
