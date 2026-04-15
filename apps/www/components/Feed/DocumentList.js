import { A, Button, Interaction, Spinner } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import PropTypes from 'prop-types'

import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'
import withInNativeApp, { useInNativeApp } from '../../lib/withInNativeApp'

import withT from '../../lib/withT'
import { WithoutAccess } from '../Auth/withMembership'
import ErrorMessage from '../ErrorMessage'
import Box from '../Frame/Box'
import Feed from './Feed'

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
  const { inNativeApp } = useInNativeApp()

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
                {!inNativeApp && (
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
              event?.preventDefault()
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
