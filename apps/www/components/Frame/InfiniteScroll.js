import { A, Spinner } from '@project-r/styleguide'
import withT from '../../lib/withT'
import { countFormat } from '../../lib/utils/format'
import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'
import ErrorMessage from '../ErrorMessage'
import { css, merge } from 'glamor'

const styles = {
  more: css({
    position: 'relative',
    height: 50,
    padding: '20px 0 0 0',
  }),
}

const InfiniteScroll = ({
  t,
  hasMore,
  loadMore,
  totalCount,
  currentCount,
  customStyles,
  loadMoreStyles,
  loadMoreKey,
  children,
}) => {
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore,
  })

  return (
    <>
      <div {...customStyles} ref={containerRef}>
        {children}
      </div>
      <div {...merge(styles.more, loadMoreStyles)}>
        {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
        {loadingMore && <Spinner />}
        {!infiniteScroll && hasMore && (
          <A
            href='#'
            onClick={(event) => {
              // eslint-disable-next-line
              event && event.preventDefault()
              setInfiniteScroll(true)
            }}
          >
            {t(loadMoreKey || 'feed/loadMore', {
              count: countFormat(currentCount),
              remaining: countFormat(totalCount - currentCount),
            })}
          </A>
        )}
      </div>
    </>
  )
}

export default withT(InfiniteScroll)
