import React, { createContext, useContext } from 'react'

type RenderProps = {
  Link?: React.FC<any>
  Share?: React.FC
}

const PlaceholderLink = ({ children }) => React.Children.only(children)

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  Share,
}) => {
  const renderContextValue = { Link, Share }
  return (
    <RenderContext.Provider value={renderContextValue}>
      {children}
    </RenderContext.Provider>
  )
}
