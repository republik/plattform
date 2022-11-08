import React, { createContext, useContext, useMemo } from 'react'
import { createFormatter } from '../../../lib/translate'
import { FlyerDate } from '../../Flyer/Date'
import { EditorContext } from '../custom-types'

export const PlaceholderLink = ({ children }) => React.Children.only(children)
const emptyFormatter = createFormatter([])

const RenderContext = createContext<EditorContext>({
  Link: PlaceholderLink,
  t: emptyFormatter,
  nav: <FlyerDate />,
  commitId: 'new',
})

export const useRenderContext = () => useContext(RenderContext)

export const RenderContextProvider: React.FC<EditorContext> = ({
  children,
  Link = PlaceholderLink,
  t = emptyFormatter,
  nav = <FlyerDate />,
  repoId,
  commitId = 'new',
}) => {
  const value = useMemo(
    () => ({ Link, t, nav, repoId, commitId }),
    [Link, t, nav, repoId, commitId],
  )
  return (
    <RenderContext.Provider value={value}>{children}</RenderContext.Provider>
  )
}
