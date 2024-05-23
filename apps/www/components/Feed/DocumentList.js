import compose from 'lodash/flowRight'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { A, Spinner, Interaction, Button } from '@project-r/styleguide'

import withT from '../../lib/withT'
import withInNativeApp, { useInNativeApp } from '../../lib/withInNativeApp'
import Feed from './Feed'
import ErrorMessage from '../ErrorMessage'

import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'
import { WithoutAccess } from '../Auth/withMembership'
import Box from '../Frame/Box'
import Link from 'next/link'

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
  const { inNativeIOSApp } = useInNativeApp()

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
            <div>
              <Box style={{ marginBottom: 30, padding: '15px 20px' }}>
                <Interaction.P>
                  Sie brauchen ein gültiges Abo, um{' '}
                  {hasSampleDocuments ? 'alle' : 'diese'} Beiträge zu lesen. Sie
                  sind schon dabei? Wunderbar, dann{' '}
                  <Link
                    href='/anmelden'
                    style={{ textDecoration: 'underline' }}
                  >
                    melden Sie sich hier an
                  </Link>
                  .
                </Interaction.P>
                {!inNativeIOSApp && (
                  <>
                    <Interaction.P>
                      Falls nicht: Höchste Zeit, an Bord zu kommen!
                    </Interaction.P>
                    <Button
                      style={{ marginTop: '1rem' }}
                      href='/angebot'
                      primary
                    >
                      Jetzt abonnieren
                    </Button>
                  </>
                )}
              </Box>
            </div>
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
