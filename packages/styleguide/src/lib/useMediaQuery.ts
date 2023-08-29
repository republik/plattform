import { useEffect, useState } from 'react'

/**
 * const matches = useMediaQuery("(min-width: 700px)")
 */
export function useMediaQuery(queryInput: string) {
  /**
   * This is purely for convenience, so we can pass strings that start
   * with "@media ".
   */
  const query = queryInput.replace(/^@media /, '')

  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    } else {
      return undefined
    }
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = ({ matches }) => {
      setMatches(matches)
    }

    // Use legacy event listener methods for compat with older browsers (Safari <14 etc.)
    mql.addListener(onChange)
    return () => {
      mql.removeListener(onChange)
    }
  }, [query, setMatches])

  return matches
}
