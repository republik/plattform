import React, { createContext, useContext, useMemo } from 'react'
import { createFormatter, Formatter } from '../../../lib/translate'
import { FlyerDate } from '../../Flyer/Date'

type RenderProps = {
  Link?: React.FC<any>
  t?: Formatter
  nav?: JSX.Element
  ShareTile?: React.FC<{ tileId: string }>
  noLazy?: boolean
}

export const PlaceholderLink = ({ children }) => React.Children.only(children)
const emptyFormatter = createFormatter([])

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
  t: emptyFormatter,
  nav: <FlyerDate />,
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  t = emptyFormatter,
  nav = <FlyerDate />,
  ShareTile,
  noLazy,
}) => {
  const value = useMemo(
    () => ({ Link, t, nav, ShareTile, noLazy }),
    [Link, t, nav, ShareTile, noLazy],
  )
  return (
    <RenderContext.Provider value={value}>{children}</RenderContext.Provider>
  )
}
