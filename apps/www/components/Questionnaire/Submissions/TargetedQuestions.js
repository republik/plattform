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
import { AnswersChart, getTargetedAnswers } from './Overview'

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

const TargetedQuestions = ({ slug, questionIds, extract, share = {} }) => {
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
        questionIds,
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

  // TODO: adapt this to work for a single question
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
      <div style={{ marginTop: 20 }}>
        <span style={{ marginRight: 20 }}>Sortierung:</span>
        {SUPPORTED_SORT.map((sort, key) => (
          <SortToggle
            key={key}
            sort={sort}
            urlSort={{ key: sortBy, direction: sortDirection }}
            getSearchParams={({ sort }) => getSortParams(query, sort)}
            pathname={pathname}
          />
        ))}
      </div>

      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { questions: allQuestions, results },
          } = data

          const questions = allQuestions.filter((q) =>
            questionIds.includes(q.id),
          )
          const [mainQuestion, addQuestion] = questions
          const targetAnswers = getTargetedAnswers(questionIds, results)

          // console.log({ answers })
          return (
            <div
              style={{
                marginBottom: 20,
                paddingTop: 50,
              }}
              ref={containerRef}
            >
              <Interaction.H2>{mainQuestion.text}</Interaction.H2>

              {mainQuestion?.__typename === 'QuestionTypeChoice' && (
                <AnswersChart question={mainQuestion} skipTitle={true} />
              )}

              {!!addQuestion && (
                <Interaction.H3 style={{ marginTop: 40 }}>
                  {addQuestion.text}
                </Interaction.H3>
              )}

              <div style={{ marginTop: 50 }}>
                {targetAnswers.map(({ answers, displayAuthor }) => (
                  <Editorial.P key={answers[0].id} attributes={{}}>
                    {answers.map((answer, idx) => (
                      <>
                        <AnswerText
                          text={answer.payload.text}
                          value={answer.payload.value}
                          question={questions[idx]}
                          isQuote
                        />
                        <br />
                      </>
                    ))}
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

export default TargetedQuestions
