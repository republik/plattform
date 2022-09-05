import React, { createContext, useContext } from 'react'
import { FormatterFunction } from '../../../lib/translate'

type RenderProps = {
  Link?: React.FC<any>
  Share?: React.FC
  t?: FormatterFunction
}

const PlaceholderLink = ({ children }) => React.Children.only(children)
const identityFn = (key: string) => key

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
  t: identityFn,
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  Share,
  t = identityFn,
}) => {
  const renderContextValue = { Link, Share, t }
  return (
    <RenderContext.Provider value={renderContextValue}>
      {children}
    </RenderContext.Provider>
  )
}
