"use client";

import "@/styles/logo.css";

type Props = {
  onSecretClick?: () => void;
};

export default function Logo({ onSecretClick }: Props) {
  return (
    <button type="button" onClick={onSecretClick} className="logo">
      <div className="logo__icon">
        <div />
      </div>

      <div className="logo__content">
        {/* <p> e não <h1>: o título principal (h1) é único em cada página */}
        <p className="logo__title">ACMRB</p>

        <p className="logo__subtitle">Plataforma ESG</p>
      </div>
    </button>
  );
}
