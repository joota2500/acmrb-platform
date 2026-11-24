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
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-brand-line bg-[repeating-linear-gradient(45deg,#f3f4f6_0_10px,#eef2f1_10px_20px)] p-1.5 text-ink-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {valor ? <img src={valor} alt="Prévia da logo" className="size-full rounded-xl bg-white object-contain" /> : <ImagePlus size={26} aria-hidden="true" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => input.current?.click()} disabled={enviando}>
          {enviando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
          {valor ? "Trocar logo" : "Enviar logo"}
        </Button>
        {valor && (
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={() => onChange("")}>
            <Trash2 size={16} aria-hidden="true" /> Remover
          </Button>
        )}
        <small className="basis-full text-[0.76rem] text-ink-muted">PNG, JPG, WEBP ou SVG · até 2 MB</small>
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => escolher(e.target.files?.[0])} />
    </div>
  );
}
