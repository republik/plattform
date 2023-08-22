import { useEffect, useState } from 'react'

export function useDebounce<T>(fastValue: T, ms = 400) {
  const [slowValue, setSlowValue] = useState<T>(fastValue)

  useEffect(() => {
    if (slowValue === fastValue) {
      return
    }
    const timer = setTimeout(() => setSlowValue(fastValue), ms)
    return () => {
      clearTimeout(timer)
    }
  }, [slowValue, fastValue, ms])

  return [slowValue]
}
