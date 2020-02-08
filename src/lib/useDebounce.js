import React from 'react'

export const useDebounce = (fastValue, ms = 400) => {
  const [slowValue, setSlowValue] = React.useState(fastValue)

  React.useEffect(() => {
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
