import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const DEFAULT_CONFIG = [{ minWidth: 0, headerHeight: 0 }]

const HeaderHeightContext = createContext({
  value: DEFAULT_CONFIG[0].headerHeight,
  rules: [],
})

export function useHeaderHeight() {
  const headerHeightContext = useContext(HeaderHeightContext)
  return [headerHeightContext.value, headerHeightContext.rules]
}

export const HeaderHeightProvider = ({ children, config = DEFAULT_CONFIG }) => {
  const [headerHeightValue, setHeaderHeightValue] = useState(
    config[0].headerHeight,
  )

  const rules = useMemo(
    () =>
      config.map(({ minWidth, headerHeight }) => ({
        mediaQuery: `@media only screen and (min-width: ${minWidth}px)`,
        headerHeight,
      })),
    [config],
  )

  useEffect(() => {
    const handleResize = () => {
      const nextHeaderHeightValue = config.reduce((acc, cur) => {
        if (window.innerWidth >= cur.minWidth) {
          return cur.headerHeight
        } else {
          return acc
        }
      }, 0)
      if (headerHeightValue !== nextHeaderHeightValue) {
        setHeaderHeightValue(nextHeaderHeightValue)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [config, headerHeightValue])

  return (
    <HeaderHeightContext.Provider value={{ value: headerHeightValue, rules }}>
      {children}
    </HeaderHeightContext.Provider>
  )
}
