import { createContext, useContext } from 'react'

const HeaderHeightContext = createContext({
  value: 0,
})

export function useHeaderHeight() {
  const headerHeightContext = useContext(HeaderHeightContext)
  return headerHeightContext.value
}

export const HeaderHeightProvider = ({ children, height = 0 }) => {
  return (
    <HeaderHeightContext.Provider value={{ value: height }}>
      {children}
    </HeaderHeightContext.Provider>
  )
}
