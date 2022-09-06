import React, { createContext, useContext } from 'react'
import { FormatterFunction } from '../../../lib/translate'

type RenderProps = {
  Link?: React.FC<any>
  t?: FormatterFunction
}

export const PlaceholderLink = ({ children }) => React.Children.only(children)
const identityFn = (key: string) => key

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
  t: identityFn,
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  t = identityFn,
}) => {
  return (
    <RenderContext.Provider value={{ Link, t }}>
      {children}
    </RenderContext.Provider>
  )
}
