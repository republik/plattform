import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { format } from 'url'
import { gql, useQuery } from '@apollo/client'
import { shuffle } from 'd3-array'

import {
  Interaction,
  Loader,
  SearchIcon,
  CloseIcon,
  Field,
  useDebounce,
  HR,
  InlineSpinner,
  plainButtonRule,
} from '@project-r/styleguide'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import Submission from './Submission'
import PlainButton from './PlainButton'
import { SortToggle } from '../../Search/Sort'
import ShareSubmission, { getSubmissionUrl } from './Share'

const SUPPORTED_SORT = [
  {
    key: 'random',
  },
  {
    key: 'createdAt',
    directions: ['DESC', 'ASC'],
  },
]

const SORT_KEY_PARAM = 'skey'
const SORT_DIRECTION_PARAM = 'sdir'
const QUERY_PARAM = 'q'

const singleSubmissionQuery = gql`
  query getSingleQuestionnaireSubmission($slug: String!, $id: ID!) {
    questionnaire(slug: $slug) {
      id
      submissions(filters: { id: $id }) {
        nodes {
          id
          createdAt
          updatedAt
          displayAuthor {
            id
            name
            slug
            profilePicture
          }
          answers {
            totalCount
            nodes {
              id
              hasMatched
              question {
                __typename
                id
              }
              payload
            }
          }
        }
      }
    }
  }
`

const mainQuery = gql`
  query getQuestionnaireSubmissions(
    $slug: String!
    $search: String
    $first: Int
    $after: String
    $sortBy: SubmissionsSortBy!
    $sortDirection: OrderDirection
  ) {
    questionnaire(slug: $slug) {
      id
      beginDate
      endDate
      userHasSubmitted
      userSubmitDate
      questions {
        __typename
        id
        text
        ... on QuestionTypeChoice {
          options {
            label
            value
            category
          }
        }
        ... on QuestionTypeRange {
          kind
          ticks {
            label
            value
          }
        }
      }
      submissions {
        totalCount
      }
      results: submissions(
        search: $search
        first: $first
        after: $after
        sort: { by: $sortBy, direction: $sortDirection }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          createdAt
          updatedAt
          displayAuthor {
            id
            name
            slug
            profilePicture
          }
          answers {
            totalCount
            nodes {
              id
              hasMatched
              question {
                __typename
                id
              }
              payload
            }
          }
        }
      }
    }
  }
`

const getSubmissionUrlWithRandomQid = (pathname, { id, answers }) =>
  getSubmissionUrl(pathname, id, {
    qid: (
      shuffle(
        answers.nodes.filter(
          (a) => a.question.__typename === 'QuestionTypeText',
        ),
      )[0] || shuffle([...answers.nodes])[0]
    ).question.id,
  })
const getTotalCount = (data) => data?.questionnaire?.submissions?.totalCount

const Submissions = ({ slug, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  const sortBy = query.skey || 'random'
  const sortDirection = query.sdir || undefined
  const searchQuery = query.q || ''
  const shareId = query.share
  const [search] = useDebounce(searchQuery, 100)
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, previousData, fetchMore } = useQuery(
    mainQuery,
    {
      variables: {
        slug,
        search,
        first: 10,
        sortBy,
        sortDirection,
      },
    },
  )
  const shareQuery = useQuery(singleSubmissionQuery, {
    skip: searchQuery || !shareId,
    variables: {
      slug,
      id: shareId,
    },
  })

  const loadMore = () => {
    return fetchMore({
      variables: {
        after: data.questionnaire.results.pageInfo.endCursor,
      },
      updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
        const previousNodes = previousResult.questionnaire.results.nodes || []
        const newNodes = fetchMoreResult.questionnaire.results.nodes || []

        const res = {
          ...previousResult,
          ...fetchMoreResult,
          questionnaire: {
            ...previousResult.questionnaire,
            ...fetchMoreResult.questionnaire,
            results: {
              ...previousResult.questionnaire.results,
              ...fetchMoreResult.questionnaire.results,
              nodes: [...previousNodes, ...newNodes],
            },
          },
        }
        return res
      },
    })
  }

  const hasMore = data?.questionnaire?.results?.pageInfo?.hasNextPage
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore,
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

  const getSearchParams = ({ sort, searchQuery }) => {
    const query = {}
    if (searchQuery) {
      query[QUERY_PARAM] = searchQuery
    }
    if (sort.key === 'random') {
      return query
    }
    query[SORT_KEY_PARAM] = sort.key
    query[SORT_DIRECTION_PARAM] = sort.direction

    return query
  }
  const onReset = () => {
    router.push(pathname, undefined, { shallow: true })
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
        value={searchQuery}
        onChange={(_, value) => {
          router[searchQuery ? 'replace' : 'push'](
            format({
              pathname,
              query: getSearchParams({
                sort: { key: sortBy, direction: sortDirection },
                searchQuery: value,
              }),
            }),
            undefined,
            { shallow: true },
          )
        }}
        icon={
          searchQuery ? (
            <button {...plainButtonRule} onClick={onReset}>
              <CloseIcon size={30} />
            </button>
          ) : (
            <SearchIcon size={30} />
          )
        }
      />
      {SUPPORTED_SORT.map((sort, key) => (
        <SortToggle
          key={key}
          sort={sort}
          urlSort={{ key: sortBy, direction: sortDirection }}
          getSearchParams={({ sort }) => getSearchParams({ sort, searchQuery })}
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
                      publicUrl={getSubmissionUrlWithRandomQid(
                        pathname,
                        shareSubmission,
                      )}
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
                          publicUrl={getSubmissionUrlWithRandomQid(pathname, {
                            id,
                            answers,
                          })}
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
