"use client";

type Props = {
  onSecretClick?: () => void;
};

export default function Logo({
  onSecretClick,
}: Props) {

  return (

    <button
      onClick={onSecretClick}
      className="flex items-center gap-4"
    >

      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">

        <div className="w-6 h-6 rounded-full bg-white/90" />

      </div>

      <div className="text-left">

        <h1 className="text-2xl font-black tracking-[-0.04em] text-zinc-900">
          ACMRB
        </h1>

        <p className="text-sm text-zinc-500 font-medium">
          Plataforma ESG
        </p>

      </div>

    </button>
  );
}