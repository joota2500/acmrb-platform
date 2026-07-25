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
        <h1 className="logo__title">ACMRB</h1>

        <p className="logo__subtitle">Plataforma ESG</p>
      </div>
    </button>
  );
}
