"use client";

/**
 * LogoUpload — envio de logo com prévia (bucket "parceiros", até 2 MB)
 */

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { enviarLogo } from "@/services/apoiadoresAdmin";
import Button from "@/components/ui/Button";

interface Props {
  valor: string | null | undefined;
  pasta: "apoiadores" | "logistica";
  onChange: (url: string) => void;
  onErro: (msg: string) => void;
}

export default function LogoUpload({ valor, pasta, onChange, onErro }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function escolher(f?: File) {
    if (!f) return;
    setEnviando(true);
    try {
      onChange(await enviarLogo(f, pasta));
    } catch (e) {
      onErro(e instanceof Error ? e.message : "Falha ao enviar a logo.");
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="admap-logo">
      <div className="admap-logo__preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {valor ? <img src={valor} alt="Prévia da logo" /> : <ImagePlus size={26} aria-hidden="true" />}
      </div>
      <div className="admap-logo__actions">
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => input.current?.click()} disabled={enviando}>
          {enviando ? <Loader2 size={16} className="admap-spin" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
          {valor ? "Trocar logo" : "Enviar logo"}
        </Button>
        {valor && (
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={() => onChange("")}>
            <Trash2 size={16} aria-hidden="true" /> Remover
          </Button>
        )}
        <small>PNG, JPG, WEBP ou SVG · até 2 MB</small>
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => escolher(e.target.files?.[0])} />
    </div>
  );
}
