import React, { createContext, useContext, useMemo } from 'react'
import { createFormatter, Formatter } from '../../../lib/translate'

type RenderProps = {
  Link?: React.FC<any>
  t?: Formatter
}

export const PlaceholderLink = ({ children }) => React.Children.only(children)
const emptyFormatter = createFormatter([])

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
  t: emptyFormatter,
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  t = emptyFormatter,
}) => {
  const value = useMemo(() => ({ Link, t }), [Link, t])
  return (
    <RenderContext.Provider value={value}>{children}</RenderContext.Provider>
  )
}
