"use client";

/**
 * MapaColetas — pedidos de coleta no mapa do painel (cor = status)
 * Carregue com next/dynamic({ ssr: false }). Reaproveita camadas e
 * estilos do mapa (mapaCamadas.ts / mapa.css).
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/mapa.css";
import { adicionarCamadas, opcoesPopup, ZOOM_MAXIMO } from "@/lib/mapaCamadas";
import { cartaoPopup, linkRotaGoogle } from "@/lib/mapaPopup";
import { BATURITE_CENTRO, BATURITE_ZOOM } from "@/lib/apoiadores";
import { ROTULO_STATUS, type Solicitacao, type StatusColeta } from "@/lib/coletas";

export const COR_STATUS: Record<StatusColeta, string> = {
  enviado: "#71717a",
  recebido: "#0284c7",
  agendado: "#d97706",
  concluido: "#2E5E4E",
  cancelado: "#dc2626",
};

interface Props {
  pedidos: Solicitacao[];
  onSelecionar?: (id: string) => void;
}

const icone = (cor: string) =>
  L.divIcon({
    className: "mapa-pin",
    html: `<span class="mapa-pin__gota" style="--pin:${cor}"><span class="mapa-pin__ponto"></span></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

export default function MapaColetas({ pedidos, onSelecionar }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadaRef = useRef<L.LayerGroup | null>(null);
  const selRef = useRef(onSelecionar);
  selRef.current = onSelecionar;

  useEffect(() => {
    if (!divRef.current || mapaRef.current) return;
    const mapa = L.map(divRef.current, { center: BATURITE_CENTRO, zoom: BATURITE_ZOOM, maxZoom: ZOOM_MAXIMO });
    adicionarCamadas(mapa, "acmrb-mapa-camada-coletas", "mapa");
    camadaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    const t = setTimeout(() => mapa.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    const camada = camadaRef.current;
    if (!mapa || !camada) return;
    camada.clearLayers();
    const com = pedidos.filter((p) => p.latitude != null && p.longitude != null);
    com.forEach((p) => {
      const html = cartaoPopup({
        nome: p.bairro,
        categoria: ROTULO_STATUS[p.status],
        cor: COR_STATUS[p.status],
        info: [p.endereco],
        descricao: p.materiais.join(", "),
        acoes: [linkRotaGoogle(p.latitude, p.longitude) ? { tipo: "rota", href: linkRotaGoogle(p.latitude, p.longitude)! } : null],
      });
      L.marker([p.latitude!, p.longitude!], { icon: icone(COR_STATUS[p.status]), title: `${p.bairro} – ${ROTULO_STATUS[p.status]}`, keyboard: true })
        .bindPopup(html, opcoesPopup(240))
        .on("click", () => selRef.current?.(p.id))
        .addTo(camada);
    });
    if (com.length > 1) mapa.fitBounds(L.latLngBounds(com.map((p) => [p.latitude!, p.longitude!] as [number, number])), { padding: [40, 40], maxZoom: 16 });
    else if (com.length === 1) mapa.setView([com[0].latitude!, com[0].longitude!], 16);
  }, [pedidos]);

  return (
    <div className="mapa-wrap">
      <div ref={divRef} className="mapa-canvas" role="region" aria-label="Mapa dos pedidos de coleta" />
    </div>
  );
}
