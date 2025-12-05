import { useRef, useState, useEffect } from 'react'

/**
 * Usage
 * const [{ containerRef, infiniteScroll, loadingMore, loadingMoreError }, setInfiniteScroll] = useInfiniteScroll({ hasMore: true, loadMore: () => new Promise() })
 * return (<div ref={containerRef}>
 *  {children}
 *  {loadingMore ? 'Loading...' : null}
 *  {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
 *  {!infiniteScroll ? <button onClick={() => setInfiniteScroll(true)}>Load More & Start Infinite Scroll</button> : null}
 * </div>)
 */
export const useInfiniteScroll = ({ hasMore, loadMore }) => {
  const containerRef = useRef(null)
  const [infiniteScroll, setInfiniteScroll] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingMoreError, setLoadingMoreError] = useState(undefined)

  useEffect(() => {
    let startedLoadingMore = false
    const onScroll = () => {
      if (containerRef.current && !startedLoadingMore) {
        const bbox = containerRef.current.getBoundingClientRect()
        if (bbox.bottom < window.innerHeight * 5) {
          // multiple scroll events might arrive
          // before removeEventListener runs
          startedLoadingMore = true
          setLoadingMore(true)
          loadMore()
            .then(() => {
              setLoadingMore(false)
              setLoadingMoreError(undefined)
            })
            .catch((error) => {
              setLoadingMore(false)
              setInfiniteScroll(false)
              setLoadingMoreError(error)
            })
        }
      }
    }
    if (infiniteScroll && hasMore && !loadingMore) {
      window.addEventListener('scroll', onScroll)
      onScroll()
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [infiniteScroll, hasMore, loadingMore, loadMore])

  return [
    {
      containerRef,
      infiniteScroll,
      loadingMore,
      loadingMoreError,
    },
    setInfiniteScroll,
  ] as const
}
