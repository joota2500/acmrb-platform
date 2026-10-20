"use client";

/**
 * Contexto com o papel do admin logado ("deus" ou "admin").
 * A barra lateral e a barra inferior usam para esconder seções sem
 * permissão, sem precisar repassar props por vários níveis.
 */

import { createContext, useContext } from "react";
import type { PapelAdmin } from "@/lib/permissions";

const PapelContext = createContext<PapelAdmin>("admin");

export const PapelProvider = PapelContext.Provider;

export function usePapelAdmin() {
  return useContext(PapelContext);
}
