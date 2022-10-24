import React, { createContext, useContext, useMemo } from 'react'
import { createFormatter, Formatter } from '../../../lib/translate'
import { FlyerDate } from '../../Flyer/Date'
import { SchemaConfig } from '../custom-types'

type RenderProps = {
  Link?: React.FC<any>
  t?: Formatter
  nav?: JSX.Element
  repoId?: string
  commitId?: string
  schema?: SchemaConfig
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
  repoId,
  commitId = 'new',
  schema,
}) => {
  const value = useMemo(
    () => ({ Link, t, nav, repoId, commitId, schema }),
    [Link, t, nav, repoId, commitId, schema],
  )
  return (
    <RenderContext.Provider value={value}>{children}</RenderContext.Provider>
  )
}
