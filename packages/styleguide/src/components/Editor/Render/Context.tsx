import React, { createContext, useContext } from 'react'

type RenderProps = {
  Link?: React.FC<any>
  Share?: React.FC
  isEditable?: boolean
}

const RenderContext = createContext<RenderProps>({})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link,
  Share,
  isEditable,
}) => {
  const renderContextValue = { Link, Share, isEditable }
  return (
    <RenderContext.Provider value={renderContextValue}>
      {children}
    </RenderContext.Provider>
  )
}
