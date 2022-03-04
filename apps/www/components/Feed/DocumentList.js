import React from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { A, Spinner, Interaction } from '@project-r/styleguide'

import withT from '../../lib/withT'
import withInNativeApp from '../../lib/withInNativeApp'
import Feed from './Feed'
import ErrorMessage from '../ErrorMessage'

import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'
import { WithoutAccess } from '../Auth/withMembership'
import Box from '../Frame/Box'

const styles = {
  more: css({
    position: 'relative',
    height: 50,
    padding: '20px 0 0 0',
  }),
}

const DocumentList = ({
  documents,
  totalCount,
  hasMore,
  loadMore,
  feedProps,
  showTotal,
  help,
  t,
}) => {
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({ hasMore, loadMore })

  if (totalCount < 1) {
    return null
  }

  const hasNoDocument = !documents.length
  const hasSampleDocuments =
    !hasNoDocument && totalCount > documents.length && !hasMore

  return (
    <>
      {showTotal && (
        <>
          <Interaction.H2>
            {t.pluralize('feed/title', {
              count: totalCount,
            })}
          </Interaction.H2>
          <br />
          <br />
        </>
      )}
      {help}
      <div ref={containerRef}>
        <Feed documents={documents} {...feedProps} />
      </div>
      {(hasNoDocument || hasSampleDocuments) && (
        <WithoutAccess
          render={() => (
            <Box style={{ marginBottom: 30, padding: '15px 20px' }}>
              <Interaction.P>
                {t(
                  `section/feed/payNote${hasSampleDocuments ? '/sample' : ''}`,
                )}
              </Interaction.P>
            </Box>
          )}
        />
      )}
      <div {...styles.more}>
        {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
        {loadingMore && <Spinner />}
        {!infiniteScroll && hasMore && (
          <A
            href='#'
            onClick={(event) => {
              event && event.preventDefault()
              setInfiniteScroll(true)
            }}
          >
            {t('feed/loadMore', {
              count: documents.length,
              remaining: totalCount - documents.length,
            })}
          </A>
        )}
      </div>
    </>
  )
}

DocumentList.propTypes = {
  documents: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  t: PropTypes.func.isRequired,
  feedProps: PropTypes.object,
  variables: PropTypes.object,
  showTotal: PropTypes.bool,
  help: PropTypes.element,
}

export default compose(withT, withInNativeApp)(DocumentList)
