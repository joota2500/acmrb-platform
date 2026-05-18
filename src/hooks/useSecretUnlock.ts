"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export function useSecretUnlock() {

  const [clicks, setClicks] =
    useState(0);

  const [unlocked, setUnlocked] =
    useState(false);

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null,
    );

  // RESET AUTO

  useEffect(() => {

    if (clicks === 0) return;

    if (timeoutRef.current) {

      clearTimeout(
        timeoutRef.current,
      );

    }

    timeoutRef.current =
      setTimeout(() => {

        setClicks(0);

      }, 2500);

    return () => {

      if (timeoutRef.current) {

        clearTimeout(
          timeoutRef.current,
        );

      }

    };

  }, [clicks]);

  // CLICK

  function handleSecretClick() {

    if (unlocked) return;

    const nextClicks =
      clicks + 1;

    setClicks(nextClicks);

    // 5 CLICKS

    if (nextClicks >= 5) {

      setUnlocked(true);

      setClicks(0);

    }

  }

  // CLOSE

  function closeAdmin() {

    setUnlocked(false);

    setClicks(0);

  }

  return {

    unlocked,

    clicks,

    handleSecretClick, 

    closeAdmin, 

  };

}