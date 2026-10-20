"use client";

/**
 * MapaSede — mapa Leaflet simples com um marcador (sede da ACMRB)
 * ------------------------------------------------------------
 * Só roda no navegador: carregue SEMPRE com next/dynamic({ ssr: false }).
 * Usa as mesmas camadas gratuitas (OSM / Esri) de src/lib/mapaCamadas.ts.
 * Não captura a rolagem da página (zoom pela roda desligado; em telas de
 * toque o arrasto só liga após "Toque para mover o mapa").
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/mapa.css";
import { adicionarCamadas, ZOOM_MAXIMO } from "@/lib/mapaCamadas";

interface Props {
  posicao: [number, number];
  titulo: string;
  endereco: string;
  aproximada?: boolean;
}

export default function MapaSede({ posicao, titulo, endereco, aproximada }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const [toque] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (!divRef.current || mapaRef.current) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mapa = L.map(divRef.current, {
      center: posicao,
      zoom: 16,
      maxZoom: ZOOM_MAXIMO,
      scrollWheelZoom: false,
      dragging: !toque,
      touchZoom: !toque,
      zoomAnimation: !reduzir,
      fadeAnimation: !reduzir,
      markerZoomAnimation: !reduzir,
    });
    adicionarCamadas(mapa, "acmrb-mapa-camada-contato", "mapa");

    const icone = L.divIcon({
      className: "mapa-pin",
      html: `<span class="mapa-pin__gota mapa-pin__gota--ativo" style="--pin:#047857"><span class="mapa-pin__ponto"></span></span>`,
      iconSize: [30, 40],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34],
    });
    const el = document.createElement("div");
    const t = document.createElement("strong");
    t.textContent = titulo;
    const e = document.createElement("p");
    e.textContent = endereco;
    el.append(t, e);
    if (aproximada) {
      const a = document.createElement("p");
      a.className = "mapa-pop__aprox";
      a.textContent = "Localização aproximada";
      el.append(a);
    }
    L.marker(posicao, { icon: icone, title: titulo, alt: titulo, keyboard: true }).addTo(mapa).bindPopup(el).openPopup();

    mapaRef.current = mapa;
    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, [posicao, titulo, endereco, aproximada, toque]);

  useEffect(() => {
    const m = mapaRef.current;
    if (m && ativo) {
      m.dragging.enable();
      m.touchZoom.enable();
    }
  }, [ativo]);

  return (
    <div className="contato-mapa__wrap">
      <div ref={divRef} className="contato-mapa__leaflet" role="region" aria-label={`Mapa: ${titulo}`} />
      {toque && !ativo && (
        <button type="button" className="contato-mapa__ativar" onClick={() => setAtivo(true)}>
          Toque para mover o mapa
        </button>
      )}
    </div>
  );
}
