import React, { createContext, useContext } from 'react'

const RenderContext = createContext({})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider = ({ children, Link, Share }) => {
  const renderContextValue = { Link, Share }
  return (
    <RenderContext.Provider value={renderContextValue}>
      {children}
    </RenderContext.Provider>
  )
}
