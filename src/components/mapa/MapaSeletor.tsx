"use client";

/**
 * MapaSeletor — mapa do painel para marcar um ponto (clicar ou arrastar)
 * ------------------------------------------------------------
 * Carregue com next/dynamic({ ssr: false }). Devolve lat/lng com 6 casas.
 * Camadas Mapa/Satélite/Híbrido (padrão Híbrido, lembra a escolha).
 * Quando o ponto chega de fora (busca), centraliza com zoom 18.
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/mapa.css";
import { adicionarCamadas, ZOOM_MAXIMO } from "@/lib/mapaCamadas";
import { BATURITE_CENTRO, BATURITE_ZOOM } from "@/lib/apoiadores";
import { iconeCategoria } from "@/components/mapa/MapaPontos";

interface Props {
  latitude: number | null;
  longitude: number | null;
  categoria: string;
  onChange: (lat: number, lng: number) => void;
}

const arred = (n: number) => Math.round(n * 1e6) / 1e6;

export default function MapaSeletor({ latitude, longitude, categoria, onChange }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const mkRef = useRef<L.Marker | null>(null);
  // último ponto emitido pelo próprio mapa (clique/arrasto): não recentraliza
  const ultimoRef = useRef<string | null>(null);
  const cbRef = useRef((lat: number, lng: number) => {
    ultimoRef.current = `${lat},${lng}`;
    onChange(lat, lng);
  });
  cbRef.current = (lat: number, lng: number) => {
    ultimoRef.current = `${lat},${lng}`;
    onChange(lat, lng);
  };

  useEffect(() => {
    if (!divRef.current || mapaRef.current) return;
    const mapa = L.map(divRef.current, { center: BATURITE_CENTRO, zoom: BATURITE_ZOOM, maxZoom: ZOOM_MAXIMO, scrollWheelZoom: false });
    // No painel o padrão é o Híbrido (satélite + nomes) para marcar com precisão
    adicionarCamadas(mapa, "acmrb-mapa-camada-admin", "hibrido");
    mapa.on("click", (e: L.LeafletMouseEvent) => cbRef.current(arred(e.latlng.lat), arred(e.latlng.lng)));
    mapaRef.current = mapa;
    // o modal pode abrir com animação: recalcula o tamanho
    const t = setTimeout(() => mapa.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      mapa.remove();
      mapaRef.current = null;
      mkRef.current = null;
    };
  }, []);

  // Sincroniza o marcador com as coordenadas do formulário
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (latitude == null || longitude == null) {
      mkRef.current?.remove();
      mkRef.current = null;
      return;
    }
    if (!mkRef.current) {
      mkRef.current = L.marker([latitude, longitude], { draggable: true, icon: iconeCategoria(categoria, true), keyboard: true, title: "Ponto do apoiador (arraste para ajustar)" })
        .on("dragend", (e) => {
          const p = (e.target as L.Marker).getLatLng();
          cbRef.current(arred(p.lat), arred(p.lng));
        })
        .addTo(mapa);
    } else {
      mkRef.current.setLatLng([latitude, longitude]);
      mkRef.current.setIcon(iconeCategoria(categoria, true));
    }
    // ponto vindo de fora (busca de endereço/CNPJ): centraliza bem perto
    if (ultimoRef.current !== `${latitude},${longitude}`) {
      mapa.setView([latitude, longitude], 18);
      ultimoRef.current = `${latitude},${longitude}`;
    }
    else if (!mapa.getBounds().contains([latitude, longitude])) mapa.setView([latitude, longitude], 17);
  }, [latitude, longitude, categoria]);

  return (
    <div className="mapa-wrap mapa-wrap--seletor">
      <div ref={divRef} className="mapa-canvas" role="application" aria-label="Clique no mapa para marcar o ponto do apoiador" />
    </div>
  );
}
