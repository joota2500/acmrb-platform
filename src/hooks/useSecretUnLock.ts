import { useEffect, useState } from 'react'

export function useSecretUnlock() {
  const [clicks, setClicks] = useState(0)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (clicks >= 5) {
      setUnlocked(true)
      setClicks(0)
    }

    const timer = setTimeout(() => {
      setClicks(0)
    }, 3000)

    return () => clearTimeout(timer)
  }, [clicks])

  const registerClick = () => {
    setClicks((prev) => prev + 1)
  }

  return {
    unlocked,
    registerClick
  }
}