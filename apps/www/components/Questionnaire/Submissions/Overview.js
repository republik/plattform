import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'url'
import { gql, useQuery } from '@apollo/client'

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
  usePrevious,
  Editorial,
  inQuotes,
  Button,
} from '@project-r/styleguide'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import Submission from './Submission'
import PlainButton from './PlainButton'
import { SortToggle } from '../../Search/Sort'
import ShareSubmission from './Share'
import { max } from 'd3-array'
import AnswerText from './AnswerText'

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
    $questionIds: [ID!]
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
        filters: { answeredQuestionIds: $questionIds }
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

const getSampleAnswers = (questions, results) => {
  return questions.map((question) => {
    const answers = results.nodes.map((submission) => {
      return {
        answer: submission.answers.nodes.find(
          (answer) => answer.question.id === question.id,
        ),
        displayAuthor: submission.displayAuthor,
      }
    })
    return {
      question,
      answers,
    }
  })
}

const getAnswersToSingleQuestion = (questionId, results) => {
  return results.nodes.map((submission) => {
    return {
      answer: submission.answers.nodes.find(
        (answer) => answer.question.id === questionId,
      ),
      displayAuthor: submission.displayAuthor,
    }
  })
}

const Submissions = ({ slug, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  const shareId = query.share
  const shareType = query.type
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
    mainQuery,
    {
      variables: {
        slug,
        search: debouncedSearch,
        first: 10,
        sortBy,
        sortDirection,
        $questionIds: shareId ? [shareId] : [],
      },
    },
  )
  const shareQuery = useQuery(singleSubmissionQuery, {
    skip: debouncedSearch || !shareId || shareType === 'question',
    variables: {
      slug,
      id: shareId,
    },
  })

  const loadMore = () => {
    return fetchMore({
      variables: {
        after: data.questionnaire.results.pageInfo.endCursor,
        questionIds: shareId ? [shareId] : [],
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
  const onReset = () => {
    setSearchValue('')
  }

  return (
    <>
      {/* <Interaction.H2 style={{ marginBottom: 15 }}>
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
          getSearchParams={({ sort }) =>
            getSearchParams({ sort, search: searchValue })
          }
          pathname={pathname}
        />
      ))}
      */}
      <Loader
        loading={loading || shareQuery.loading}
        error={error || shareQuery.error}
        render={() => {
          const {
            questionnaire: { questions, results },
          } = data

          if (shareId && shareType === 'question') {
            const question = questions.find((q) => q.id === shareId)
            const answers = getAnswersToSingleQuestion(shareId, results)
            return (
              <div
                key={question.id}
                style={{
                  marginBottom: 20,
                  paddingTop: 20,
                  borderTop: '1px solid black',
                }}
                ref={containerRef}
              >
                <Interaction.H3>{question.text}</Interaction.H3>
                {answers.map(({ answer, displayAuthor }) => (
                  <Editorial.P key={question.id} attributes={{}}>
                    <AnswerText
                      text={answer.payload.text}
                      value={answer.payload.value}
                      question={question}
                      isQuote
                    />
                    <br />
                    <em>– {displayAuthor.name}</em>
                  </Editorial.P>
                ))}
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
            )
          }

          const sampleAnswers = getSampleAnswers(questions, results)

          return (
            <div style={{ marginTop: 80 }}>
              {sampleAnswers.map(({ question, answers }) => {
                const usableAnswers = answers.filter(({ answer }) => !!answer)
                const randomIdx = Math.floor(
                  Math.random() * usableAnswers.length,
                )
                const { answer, displayAuthor } = usableAnswers[randomIdx]
                // console.log({ answer, displayAuthor })
                return (
                  <div
                    key={question.id}
                    style={{
                      marginBottom: 20,
                      paddingTop: 20,
                      borderTop: '1px solid black',
                    }}
                  >
                    <Interaction.H3>{question.text}</Interaction.H3>
                    <Editorial.P key={question.id}>
                      <AnswerText
                        text={answer.payload.text}
                        value={answer.payload.value}
                        question={question}
                        isQuote
                      />
                      <br />
                      <em>– {displayAuthor.name}</em>
                    </Editorial.P>
                    <Button
                      small
                      onClick={() => {
                        router.replace({
                          pathname,
                          query: {
                            share: question.id,
                            type: 'question',
                          },
                        })
                      }}
                    >
                      alle Antworte lesen
                    </Button>
                  </div>
                )
              })}
              {/*
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
              */}
            </div>
          )
        }}
      />
    </>
  )
}

export default Submissions
