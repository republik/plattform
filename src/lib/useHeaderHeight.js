import React from 'react'

const DEFAULT_CONFIG = [{ minWidth: 0, headerHeight: 0 }]

const HeaderHeightContext = React.createContext({
  value: 0,
  rules: []
})

export const useHeaderHeight = () => {
  const headerHeightContext = React.useContext(HeaderHeightContext)
  return [headerHeightContext.value, headerHeightContext.rules]
}

export const HeaderHeightProvider = ({ children, config = DEFAULT_CONFIG }) => {
  const [headerHeightValue, setHeaderHeightValue] = React.useState(0)

  const rules = React.useMemo(
    () =>
      config.map(({ minWidth, headerHeight }) => ({
        mediaQuery: `@media only screen and (min-width: ${minWidth}px)`,
        headerHeight
      })),
    [config]
  )

  const handleResize = () => {
    if (window) {
      const nextHeaderHeightValue = config.reduce((acc, cur) => {
        if (window.innerWidth >= cur.minWidth && cur.minWidth >= acc) {
          return cur.headerHeight
        } else {
          return acc
        }
      }, 0)
      if (headerHeightValue !== nextHeaderHeightValue) {
        setHeaderHeightValue(nextHeaderHeightValue)
      }
    }
  }

  React.useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <HeaderHeightContext.Provider value={{ value: headerHeightValue, rules }}>
      {children}
    </HeaderHeightContext.Provider>
  )
}
