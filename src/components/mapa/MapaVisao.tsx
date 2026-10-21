"use client";

/**
 * MapaVisao — mapa grande do painel ("Visão do Mapa", só ADM DEUS)
 * ------------------------------------------------------------
 * Mostra TODOS os pontos (inclusive ocultos do site, com marcador
 * tracejado/apagado) e, opcionalmente, um marcador de SUGESTÃO
 * arrastável usado na localização em lote (o admin confirma).
 * Carregue com next/dynamic({ ssr: false }).
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/mapa.css";
import { cartaoPopup, linkRotaGoogle } from "@/lib/mapaPopup";
import { BATURITE_CENTRO, BATURITE_ZOOM, corCategoria } from "@/lib/apoiadores";
import { adicionarCamadas, ZOOM_MAXIMO, opcoesPopup } from "@/lib/mapaCamadas";

export interface PontoVisao {
  id: string;
  nome: string;
  categoria: string;
  tipo: "Apoiador" | "Logística";
  lat: number;
  lng: number;
  oculto: boolean;
  bairro?: string | null;
}

interface Props {
  pontos: PontoVisao[];
  selecionado?: string | null;
  onSelecionar?: (id: string) => void;
  sugestao?: { lat: number; lng: number } | null;
  onMoverSugestao?: (lat: number, lng: number) => void;
}

const arred = (n: number) => Math.round(n * 1e6) / 1e6;

function icone(cor: string, oculto: boolean, extra = "") {
  return L.divIcon({
    className: "mapa-pin",
    html: `<span class="mapa-pin__gota${oculto ? " mapa-pin__gota--oculto" : ""}${extra}" style="--pin:${cor}"><span class="mapa-pin__ponto"></span></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

export default function MapaVisao({ pontos, selecionado, onSelecionar, sugestao, onMoverSugestao }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadaRef = useRef<L.LayerGroup | null>(null);
  const marcadores = useRef<Map<string, L.Marker>>(new Map());
  const sugRef = useRef<L.Marker | null>(null);
  const moverRef = useRef(onMoverSugestao);
  moverRef.current = onMoverSugestao;
  const ajustouRef = useRef(false);
  const arrastouRef = useRef<string | null>(null);

  useEffect(() => {
    if (!divRef.current || mapaRef.current) return;
    const mapa = L.map(divRef.current, { center: BATURITE_CENTRO, zoom: BATURITE_ZOOM, maxZoom: ZOOM_MAXIMO });
    adicionarCamadas(mapa, "acmrb-mapa-camada-visao", "hibrido");
    camadaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    const t = setTimeout(() => mapa.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      mapa.remove();
      mapaRef.current = null;
      sugRef.current = null;
    };
  }, []);

  // Pontos
  useEffect(() => {
    const mapa = mapaRef.current;
    const camada = camadaRef.current;
    if (!mapa || !camada) return;
    camada.clearLayers();
    marcadores.current.clear();
    pontos.forEach((p) => {
      const html = cartaoPopup({
        nome: p.nome,
        categoria: p.tipo === "Logística" ? "Logística reversa" : p.categoria,
        cor: corCategoria(p.categoria),
        info: [p.bairro],
        nota: p.oculto ? "Oculto no site" : null,
        acoes: [linkRotaGoogle(p.lat, p.lng) ? { tipo: "rota", href: linkRotaGoogle(p.lat, p.lng)! } : null],
      });
      const mk = L.marker([p.lat, p.lng], { icon: icone(corCategoria(p.categoria), p.oculto), title: p.nome, keyboard: true })
        .bindPopup(html, opcoesPopup(240))
        .on("click", () => onSelecionar?.(p.id))
        .addTo(camada);
      marcadores.current.set(p.id, mk);
    });
    // enquadra todos só na primeira carga (não pula a cada filtro)
    if (!ajustouRef.current && pontos.length) {
      ajustouRef.current = true;
      if (pontos.length > 1) mapa.fitBounds(L.latLngBounds(pontos.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40], maxZoom: 16 });
      else mapa.setView([pontos[0].lat, pontos[0].lng], 16);
    }
  }, [pontos, onSelecionar]);

  useEffect(() => {
    if (!selecionado) return;
    const mk = marcadores.current.get(selecionado);
    if (mk && mapaRef.current) {
      mapaRef.current.setView(mk.getLatLng(), Math.max(mapaRef.current.getZoom(), 17));
      mk.openPopup();
    }
  }, [selecionado]);

  // Marcador de sugestão (arrastável)
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (!sugestao) {
      sugRef.current?.remove();
      sugRef.current = null;
      return;
    }
    if (!sugRef.current) {
      sugRef.current = L.marker([sugestao.lat, sugestao.lng], {
        draggable: true, icon: icone("#dc2626", false, " mapa-pin__gota--ativo"), zIndexOffset: 1000, title: "Posição sugerida (arraste para ajustar)",
      })
        .on("dragend", (e) => {
          const p = (e.target as L.Marker).getLatLng();
          arrastouRef.current = `${arred(p.lat)},${arred(p.lng)}`;
          moverRef.current?.(arred(p.lat), arred(p.lng));
        })
        .addTo(mapa);
    } else sugRef.current.setLatLng([sugestao.lat, sugestao.lng]);
    // não recentraliza depois de um arrasto do próprio admin
    if (arrastouRef.current !== `${sugestao.lat},${sugestao.lng}`) mapa.setView([sugestao.lat, sugestao.lng], 18);
  }, [sugestao]);

  return (
    <div className="mapa-wrap">
      <div ref={divRef} className="mapa-canvas" role="region" aria-label="Mapa com todos os apoiadores e empresas" />
    </div>
  );
}
