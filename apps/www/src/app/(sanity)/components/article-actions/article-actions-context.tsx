'use client'

import { createContext, useContext, useMemo, useState } from 'react'

type ArticleActionsContextValue = {
  /**
   * Whether the top action row has been scrolled past, i.e. it sits above the
   * viewport. False while it's still on screen, and false while it's still
   * below the viewport (e.g. a large cover image pushes it below the fold on
   * initial load) — in both cases the floating bar must stay hidden.
   */
  topActionsCleared: boolean
  setTopActionsEntry: (entry: IntersectionObserverEntry) => void
}

const ArticleActionsContext = createContext<ArticleActionsContextValue>({
  topActionsCleared: false,
  setTopActionsEntry: () => {},
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
  const [topActionsCleared, setTopActionsCleared] = useState(false)

  const setTopActionsEntry = (entry: IntersectionObserverEntry) => {
    // `boundingClientRect.top < 0` means the row is above the viewport, i.e.
    // scrolled past — as opposed to not intersecting because it hasn't been
    // reached yet (still below the viewport).
    setTopActionsCleared(
      !entry.isIntersecting && entry.boundingClientRect.top < 0,
    )
  }

  const value = useMemo(
    () => ({ topActionsCleared, setTopActionsEntry }),
    [topActionsCleared],
  )

  return (
    <ArticleActionsContext.Provider value={value}>
      {children}
    </ArticleActionsContext.Provider>
  )
}
