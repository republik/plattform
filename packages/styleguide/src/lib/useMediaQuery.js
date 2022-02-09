import React from 'react'

/**
 * const matches = useMediaQuery("(min-width: 700px)")
 *
 * @param {string} queryInput
 * @returns {boolean}
 */
export const useMediaQuery = (queryInput) => {
  /**
   * This is purely for convenience, so we can pass strings that start
   * with "@media ".
   */
  const query = queryInput.replace(/^@media /, '')

  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    } else {
      return undefined
    }
  })

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = ({ matches }) => {
      setMatches(matches)
    }
    mql.addListener(onChange)
    return () => {
      mql.removeListener(onChange)
    }
  }, [query, setMatches])

  return matches
}
