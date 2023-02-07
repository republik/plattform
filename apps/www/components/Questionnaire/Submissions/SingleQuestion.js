import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Button,
  Editorial,
  InlineSpinner,
  Interaction,
  Loader,
} from '@project-r/styleguide'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import PlainButton from './PlainButton'
import { SortToggle } from '../../Search/Sort'
import ShareSubmission from './Share'
import AnswerText from './AnswerText'
import {
  hasMoreData,
  loadMoreSubmissions,
  QUESTIONNAIRE_SUBMISSIONS_QUERY,
  SORT_DIRECTION_PARAM,
  SORT_KEY_PARAM,
  SUPPORTED_SORT,
} from './graphql'

const getSortParams = (query, sort) => {
  if (sort.key === 'random' || !sort.key) {
    const {
      [SORT_KEY_PARAM]: key,
      [SORT_DIRECTION_PARAM]: dir,
      ...restQuery
    } = query
    return restQuery
  }
  return {
    ...query,
    [SORT_KEY_PARAM]: sort.key,
    [SORT_DIRECTION_PARAM]: sort.direction,
  }
}

const getAnswersToSingleQuestion = (questionId, results) => {
  return results.nodes.map((submission) => {
    const answer = submission.answers.nodes.find(
      (answer) => answer.question.id === questionId,
    )
    return {
      answer,
      displayAuthor: submission.displayAuthor,
    }
  })
}

const SingleQuestion = ({ slug, questionId, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = router
  const sortBy = query.skey || 'random'
  const sortDirection = query.sdir || undefined
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, fetchMore } = useQuery(
    QUESTIONNAIRE_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 20,
        sortBy,
        sortDirection,
        questionIds: [questionId],
      },
    },
  )

  const hasMore = hasMoreData(data)
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore: loadMoreSubmissions(fetchMore, data),
  })

  const questions = data?.questionnaire?.questions || []

  // TODO: adapt this to work for a single quesiton
  const shareSubmission = data?.questionnaire?.submissions?.nodes?.[0]
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

  return (
    <>
      <Button
        small
        onClick={() => {
          router.replace({
            pathname,
          })
        }}
      >
        Zurück
      </Button>
      {SUPPORTED_SORT.map((sort, key) => (
        <SortToggle
          key={key}
          sort={sort}
          urlSort={{ key: sortBy, direction: sortDirection }}
          getSearchParams={({ sort }) => getSortParams(query, sort)}
          pathname={pathname}
        />
      ))}

      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { questions, results },
          } = data

          const question = questions.find((q) => q.id === questionId)
          const answers = getAnswersToSingleQuestion(questionId, results)

          // console.log({ answers })
          return (
            <div
              key={question.id}
              style={{
                marginBottom: 20,
                paddingTop: 50,
              }}
              ref={containerRef}
            >
              <Interaction.H2>{question.text}</Interaction.H2>
              <div style={{ marginTop: 50 }}>
                {answers.map(({ answer, displayAuthor }) => (
                  <Editorial.P key={answer.id} attributes={{}}>
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
              </div>
              <div style={{ marginTop: 10 }}>
                {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
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
        }}
      />
    </>
  )
}

export default SingleQuestion
