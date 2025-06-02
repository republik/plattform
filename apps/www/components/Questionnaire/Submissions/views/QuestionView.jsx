import { useEffect, useRef } from 'react'

import scrollIntoView from 'scroll-into-view'
import { useQuery } from '@apollo/client'

import {
  InlineSpinner,
  Interaction,
  Loader,
  Editorial,
  Center,
  useHeaderHeight,
} from '@project-r/styleguide'
import { css } from 'glamor'

import { useInfiniteScroll } from '../../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../../lib/withT'
import ErrorMessage from '../../../ErrorMessage'

import {
  hasMoreData,
  loadMoreSubmissions,
  QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
} from '../graphql'
import { AnswersChart, getTargetedAnswers } from '../components/QaBlock'
import { ShareImage } from '../components/ShareImage'
import QuestionnaireMeta from '../components/QuestionnaireMeta'
import { replaceText } from '../utils'

import { OverviewLink, SubmissionLink } from '../components/Links'
import { AnswersCombo } from '../components/AnswersCombo'

const QuestionView = ({
  slug,
  questionIds,
  extract,
  share = {},
  shareImg,
  questions,
  questionColor,
  questionnaireBgColor,
}) => {
  const { t } = useTranslation()
  const [headerHeight] = useHeaderHeight()
  const { loading, error, data, fetchMore } = useQuery(
    QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 20,
        sortBy: 'random',
        answers: questionIds.map((questionId) => ({ questionId })),
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

  const questionRef = useRef()
  useEffect(() => {
    if (extract) return
    scrollIntoView(questionRef.current, {
      time: 0,
      align: { topOffset: headerHeight, top: 0 },
    })
  }, [])

  const allQuestions = data?.questionnaire?.questions

  const currentQuestions =
    allQuestions?.filter((q) => questionIds.includes(q.id)) ?? []
  const [mainQuestion, additionalQuestion] = currentQuestions

  const shareText = mainQuestion?.text

  if (extract) {
    return (
      <ShareImage
        img={shareImg}
        text={shareText}
        bgColor={questionnaireBgColor}
      />
    )
  }

  const questionsType =
    mainQuestion?.__typename === 'QuestionTypeChoice'
      ? 'choice-text'
      : currentQuestions.length === 2
      ? 'text-text'
      : 'text'

  const questionGroupIdx = questions.findIndex(
    (q) => allQuestions && allQuestions[q.ids[0]]?.id === questionIds[0],
  )

  return (
    <div ref={questionRef}>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results },
          } = data

          const targetAnswers = getTargetedAnswers(questionIds, results)
          return (
            <>
              <QuestionnaireMeta share={share} shareText={shareText} />
              <div style={{ backgroundColor: questionColor(questionGroupIdx) }}>
                <div
                  style={{
                    marginTop: 48,
                    marginBottom: 20,
                    paddingTop: 24,
                  }}
                  ref={containerRef}
                >
                  <Center>
                    <div style={{ textAlign: 'center' }}>
                      <OverviewLink focus={questionIds[0]} />
                      <Editorial.Subhead>
                        {mainQuestion.text}
                        {questionsType === 'text-text' && (
                          <>
                            <hr
                              style={{
                                opacity: 0.7,
                                margin: '1.2em 33%',
                                border: 0,
                                borderTop: '1px solid currentColor',
                              }}
                            />
                            <span>{additionalQuestion.text}</span>
                          </>
                        )}
                      </Editorial.Subhead>

                      {questionsType === 'choice-text' && (
                        <>
                          <AnswersChart
                            question={mainQuestion}
                            skipTitle={true}
                          />
                          <br />
                          <Editorial.Subhead style={{ textAlign: 'center' }}>
                            {additionalQuestion.text}
                          </Editorial.Subhead>
                        </>
                      )}
                    </div>

                    <div {...styles.answerCardWrapper}>
                      {targetAnswers.map(({ answers, displayAuthor, id }) => (
                        <SubmissionLink submissionId={id} key={id}>
                          <a style={{ textDecoration: 'none' }}>
                            <AnswersCombo
                              answers={answers}
                              questions={currentQuestions}
                              author={displayAuthor}
                              questionsType={questionsType}
                            />
                          </a>
                        </SubmissionLink>
                      ))}
                    </div>

                    <div style={{ paddingBottom: 24 }}>
                      {loadingMoreError && (
                        <ErrorMessage error={loadingMoreError} />
                      )}
                      {loadingMore && <InlineSpinner />}
                      {!infiniteScroll && hasMore && (
                        <Interaction.P style={{ textAlign: 'center' }}>
                          <Editorial.A
                            onClick={() => {
                              setInfiniteScroll(true)
                            }}
                          >
                            {t.pluralize(
                              'questionnaire/submissions/showAnswers',
                              {
                                count:
                                  results.totalCount - results.nodes.length,
                              },
                            )}
                          </Editorial.A>
                        </Interaction.P>
                      )}
                    </div>
                  </Center>
                </div>
              </div>
            </>
          )
        }}
      />
    </div>
  )
}

export default QuestionView

const styles = {
  answerCardWrapper: css({
    marginTop: 40,
  }),
}
