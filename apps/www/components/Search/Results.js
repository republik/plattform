import { createElement, Fragment } from 'react';
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import withT from '../../lib/withT'
import Loader from '../../components/Loader'
import UserResult from './UserResult'
import DocumentResult from './DocumentResult'
import CommentResult from './CommentResult'
import { withResults } from './enhancers'
import {
  A,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import withSearchRouter from './withSearchRouter'
import { countFormat } from '../../lib/utils/format'

const RESULT_COMPONENTS = {
  Document: DocumentResult,
  Comment: CommentResult,
  User: UserResult,
}

const styles = {
  container: css({
    paddingTop: 0,
    paddingBottom: 120,
  }),
  results: css({
    paddingTop: 5,
  }),
  countLoaded: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    textAlign: 'left',
    ...fontStyles.sansSerifRegular16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular21,
    },
  }),
}

const ResultsList = ({ nodes }) => {
  const nodeType = nodes[0].entity.__typename

  return <>
    {nodes.map((node, index) => {
      return (
        <Fragment key={index}>
          {createElement(RESULT_COMPONENTS[nodeType], {
            node: node,
          })}
        </Fragment>
      );
    })}
  </>;
}

const ResultsFooter = compose(withT)(
  ({ t, search: { nodes, totalCount, pageInfo }, fetchMore }) => {
    const [colorScheme] = useColorContext()
    return (
      <div {...styles.countLoaded} {...colorScheme.set('borderColor', 'text')}>
        {nodes.length === totalCount
          ? t.pluralize('search/pageInfo/total', {
              count: countFormat(totalCount),
            })
          : t('search/pageInfo/loadedTotal', {
              loaded: countFormat(nodes.length),
              total: countFormat(totalCount),
            })}
        {pageInfo.hasNextPage && (
          <A
            href='#'
            onClick={(e) => {
              e.preventDefault()
              fetchMore({ after: pageInfo.endCursor })
            }}
          >
            {t('search/pageInfo/loadMore')}
          </A>
        )}
      </div>
    )
  },
)

const Results = compose(
  withSearchRouter,
  withResults,
)(({ data: { loading, error, search } = {}, fetchMore }) => {
  return (
    <div {...styles.container}>
      <Loader
        loading={
          loading ||
          // wait for index to switch tab
          (search && search.totalCount === 0)
        }
        error={error}
        render={() => {
          return (
            <div {...styles.results}>
              <ResultsList nodes={search.nodes} />
              <ResultsFooter search={search} fetchMore={fetchMore} />
            </div>
          )
        }}
      />
    </div>
  )
})

export default Results
