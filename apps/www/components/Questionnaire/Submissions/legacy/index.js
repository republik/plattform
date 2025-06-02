import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'url'
import { useQuery } from '@apollo/client'

import {
  Interaction,
  Loader,
  Field,
  useDebounce,
  HR,
  InlineSpinner,
  plainButtonRule,
  usePrevious,
} from '@project-r/styleguide'

import { useInfiniteScroll } from '../../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../../lib/withT'
import ErrorMessage from '../../../ErrorMessage'
import Submission from './Submission'
import PlainButton from './PlainButton'
import { SortToggle } from '../../../Search/Sort'
import ShareSubmission from './Share'
import {
  hasMoreData,
  loadMoreSubmissions,
  QUERY_PARAM,
  QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
  SINGLE_SUBMISSION_QUERY,
  SORT_DIRECTION_PARAM,
  SORT_KEY_PARAM,
  SUPPORTED_SORT,
} from '../graphql'
import { IconClose, IconSearch } from '@republik/icons'

const getTotalCount = (data) => data?.questionnaire?.submissions?.totalCount
const getSearchParams = ({ sort, search }) => {
  const query = {}
  if (search) {
    query[QUERY_PARAM] = search
  }
  if (sort.key === 'random' || !sort.key) {
    return query
  }
  query[SORT_KEY_PARAM] = sort.key
  query[SORT_DIRECTION_PARAM] = sort.direction

  return query
}

const Submissions = ({ slug, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  const shareId = query.share
  const sortBy = query.skey || 'random'
  const sortDirection = query.sdir || undefined
  const searchQuery = query.q || ''
  const prevSearchQuery = usePrevious(searchQuery)
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [debouncedSearch] = useDebounce(searchValue, 200)
  useEffect(() => {
    if (prevSearchQuery !== searchQuery && searchValue !== searchQuery) {
      setSearchValue(searchQuery)
    }
  }, [searchQuery, prevSearchQuery, searchValue])
  useEffect(() => {
    if ((debouncedSearch || '') === (router.query.q || '')) {
      return
    }
    router[router.query.q ? 'replace' : 'push'](
      format({
        pathname,
        query: getSearchParams({
          sort: { key: router.query.skey, direction: router.query.sdir },
          search: debouncedSearch,
        }),
      }),
      undefined,
      { shallow: true },
    )
  }, [debouncedSearch])
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, previousData, fetchMore } = useQuery(
    QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        search: debouncedSearch,
        first: 10,
        sortBy,
        sortDirection,
      },
    },
  )
  const shareQuery = useQuery(SINGLE_SUBMISSION_QUERY, {
    skip: debouncedSearch || !shareId,
    variables: {
      slug,
      id: shareId,
    },
  })

  const hasMore = hasMoreData(data)
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore: loadMoreSubmissions(fetchMore, data),
  })

  const questions = data?.questionnaire?.questions || []
  const shareSubmission =
    shareQuery.data?.questionnaire?.submissions?.nodes?.[0]

  if (extract) {
    if (query.extract && shareSubmission) {
      return (
        <ShareSubmission
          pathname={pathname}
          qid={query.qid}
          share={share}
          submission={shareSubmission}
          questions={questions}
        />
      )
    }
    return null
  }
  const onReset = () => {
    setSearchValue('')
  }

  return (
    <>
      <Interaction.H2 style={{ marginBottom: 15 }}>
        {t.pluralize('questionnaire/submissions/count', {
          count: getTotalCount(data) || getTotalCount(previousData) || '',
        })}
      </Interaction.H2>
      <Field
        label='Suche'
        value={searchValue}
        onChange={(_, value) => {
          setSearchValue(value)
        }}
        icon={
          searchValue ? (
            <button {...plainButtonRule} onClick={onReset}>
              <IconClose size={30} />
            </button>
          ) : (
            <IconSearch size={30} />
          )
        }
      />
      {SUPPORTED_SORT.map((sort, key) => (
        <SortToggle
          key={key}
          sort={sort}
          urlSort={{ key: sortBy, direction: sortDirection }}
          getSearchParams={({ sort }) =>
            getSearchParams({ sort, search: searchValue })
          }
          pathname={pathname}
        />
      ))}
      <Loader
        loading={loading || shareQuery.loading}
        error={error || shareQuery.error}
        render={() => {
          const {
            questionnaire: { results },
          } = data

          return (
            <>
              {results.totalCount !== getTotalCount(data) && (
                <Interaction.P style={{ marginTop: 15 }}>
                  {t.pluralize('search/preloaded/results', {
                    count: results.totalCount,
                  })}
                </Interaction.P>
              )}
              <div ref={containerRef} style={{ marginTop: 30 }}>
                {shareSubmission && (
                  <>
                    <ShareSubmission
                      meta
                      pathname={pathname}
                      qid={query.qid}
                      share={share}
                      submission={shareSubmission}
                      questions={questions}
                    />
                    <Submission
                      t={t}
                      pathname={pathname}
                      questions={questions}
                      {...shareSubmission}
                      isHighlighted
                    />
                    <HR />
                  </>
                )}
                {results.nodes.map(
                  ({ id, displayAuthor, answers, createdAt, updatedAt }) => {
                    if (id === shareSubmission?.id) {
                      return null
                    }

                    return (
                      <Fragment key={id}>
                        <Submission
                          t={t}
                          id={id}
                          pathname={pathname}
                          displayAuthor={displayAuthor}
                          answers={answers}
                          questions={questions}
                          createdAt={createdAt}
                          updatedAt={updatedAt}
                        />
                        <HR />
                      </Fragment>
                    )
                  },
                )}
                <div style={{ marginTop: 10 }}>
                  {loadingMoreError && (
                    <ErrorMessage error={loadingMoreError} />
                  )}
                  {loadingMore && <InlineSpinner />}
                  {!infiniteScroll && hasMore && (
                    <PlainButton
                      onClick={() => {
                        setInfiniteScroll(true)
                      }}
                    >
                      {t.pluralize('questionnaire/submissions/loadMore', {
                        count: results.totalCount - results.nodes.length,
                      })}
                    </PlainButton>
                  )}
                </div>
              </div>
            </>
          )
        }}
      />
    </>
  )
}

export default Submissions
