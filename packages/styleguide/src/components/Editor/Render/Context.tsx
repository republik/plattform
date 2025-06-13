import React, { createContext, ReactNode, useContext, useMemo } from 'react'
import { createFormatter, Formatter } from '../../../lib/translate'
import { FlyerDate } from '../../Flyer/Date'

type RenderProps = {
  children?: ReactNode
  Link?: React.FC<any>
  t?: Formatter
  nav?: ReactNode
  ShareTile?: React.FC<{ tileId: string }>
  noLazy?: boolean
  commitId?: string
  repoId?: string
}

export const PlaceholderLink = ({ children }) => React.Children.only(children)
const emptyFormatter = createFormatter([])

const RenderContext = createContext<RenderProps>({
  Link: PlaceholderLink,
  t: emptyFormatter,
  nav: <FlyerDate />,
  commitId: 'new',
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<RenderProps> = ({
  children,
  Link = PlaceholderLink,
  t = emptyFormatter,
  nav = <FlyerDate />,
  ShareTile,
  noLazy,
  repoId,
  commitId = 'new',
}) => {
  const value = useMemo(
    () => ({ Link, t, nav, ShareTile, noLazy, repoId, commitId }),
    [Link, t, nav, ShareTile, noLazy, repoId, commitId],
  )
  return (
    <RenderContext.Provider value={value}>{children}</RenderContext.Provider>
  )
}
