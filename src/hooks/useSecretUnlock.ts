"use client";

import { useState } from "react";

export function useSecretUnlock() {

  const [clicks, setClicks] = useState(0);

  const [unlocked, setUnlocked] = useState(false);

  function handleSecretClick() {

    const next = clicks + 1;

    setClicks(next);

    if (next >= 5) {

      setUnlocked(true);

      setClicks(0);

    }

  }

  function closeAdmin() {

    setUnlocked(false);

  }

  return {
    unlocked,
    handleSecretClick,
    closeAdmin,
  };
}