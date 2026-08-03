'use client'

import { createContext, useContext, useMemo, useState } from 'react'

type ArticleActionsContextValue = {
  /** Whether the top action row is currently in the viewport. */
  topActionsInView: boolean
  setTopActionsInView: (inView: boolean) => void
}

const ArticleActionsContext = createContext<ArticleActionsContextValue>({
  topActionsInView: false,
  setTopActionsInView: () => {},
})

export const useArticleActions = () => useContext(ArticleActionsContext)

/**
 * Lets the floating action bar know whether the top action row is on screen, so
 * the two are never visible at the same time.
 */
export function ArticleActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [topActionsInView, setTopActionsInView] = useState(false)

  const value = useMemo(
    () => ({ topActionsInView, setTopActionsInView }),
    [topActionsInView],
  )

  return (
    <ArticleActionsContext.Provider value={value}>
      {children}
    </ArticleActionsContext.Provider>
  )
}
