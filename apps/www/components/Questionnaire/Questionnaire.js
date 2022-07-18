import { useState } from 'react'
import Loader from '../Loader'

import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { CheckCircleIcon, useColorContext } from '@project-r/styleguide'

import {
  Interaction,
  InlineSpinner,
  RawHtml,
  useHeaderHeight,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import withAuthorization from '../Auth/withAuthorization'
import StatusError from '../StatusError'
import {
  withQuestionnaire,
  withQuestionnaireMutation,
  withQuestionnaireReset,
  withQuestionnaireRevoke,
} from './enhancers'
import Questions from './Questions'
import QuestionnaireClosed from './QuestionnaireClosed'
import QuestionnaireActions from './QuestionnaireActions'
import ErrorMessage from '../ErrorMessage'

const { Headline, P } = Interaction

const styles = {
  intro: css({
    marginTop: 35,
  }),
  count: css({
    zIndex: 10,
    position: 'sticky',
    padding: '10px 0',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    display: 'flex',
    minHeight: 55,
  }),
  progressIcon: css({
    marginLeft: 5,
    marginTop: 3,
    minHeight: 30,
  }),
}

export const actionStyles = css({
  textAlign: 'center',
  margin: '20px auto 20px auto',
})

const Questionnaire = (props) => {
  const {
    questionnaireData,
    submitQuestionnaire,
    resetQuestionnaire,
    revokeQuestionnaire,
    onQuestionnaireChange,
  } = props
  const [state, setState] = useState({})
  const [isResubmitAnswers, setIsResubmitAnswers] = useState(false)
  const [headerHeight] = useHeaderHeight()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const id = questionnaireData.questionnaire?.id

  const processSubmit = (fn, ...args) => {
    setState({ updating: true })
    return fn(...args)
      .then(() => {
        onQuestionnaireChange && onQuestionnaireChange()
        return setState({
          updating: false,
        })
      })
      .catch((error) => {
        setState({
          updating: false,
          error,
        })
      })
  }

  const handleSubmit = () => {
    if (isResubmitAnswers) {
      setIsResubmitAnswers(false)
    }
    processSubmit(submitQuestionnaire, id).then(() => window.scrollTo(0, 0))
  }

  const handleReset = () => {
    processSubmit(resetQuestionnaire, id).then(() => window.scrollTo(0, 0))
  }

  const {
    showResults,
    submittedMessage,
    questionnaireName,
    externalSubmit,
    hideCount,
    sliceAt,
    showSlice2,
    slug,
  } = props

  return (
    <Loader
      loading={questionnaireData.loading}
      error={questionnaireData.error}
      render={() => {
        const now = new Date()
        // handle not found or not started
        if (
          !questionnaireData.questionnaire ||
          new Date(questionnaireData.questionnaire.beginDate) > now
        ) {
          return (
            <StatusError statusCode={404} serverContext={props.serverContext} />
          )
        }

        const hasEnded = now > new Date(questionnaireData.questionnaire.endDate)

        // handle already submitted
        const {
          questionnaire: {
            userHasSubmitted,
            questions,
            resubmitAnswers,
            revokeSubmissions,
          },
        } = questionnaireData
        const error = state.error || props.error
        const updating = state.updating || props.updating || props.submitting

        if (!updating && userHasSubmitted && submittedMessage) {
          return submittedMessage
        }

        if (!updating && !isResubmitAnswers && (hasEnded || userHasSubmitted)) {
          return (
            <QuestionnaireClosed
              submitted={userHasSubmitted}
              showResults={showResults}
              slug={slug}
              onResubmit={
                resubmitAnswers &&
                (() => {
                  setIsResubmitAnswers(true)
                })
              }
              onRevoke={
                revokeSubmissions &&
                (() => {
                  processSubmit(revokeQuestionnaire, id).then(() =>
                    window.scrollTo(0, 0),
                  )
                })
              }
            />
          )
        }

        // handle questions
        const questionCount = questions.filter(Boolean).length
        const userAnswerCount = questions
          .map((q) => q.userAnswer)
          .filter(Boolean).length

        return (
          <div>
            {questionnaireName && (
              <>
                <Headline>
                  {t(`questionnaire/${questionnaireName}/title`)}
                </Headline>
                <div {...styles.intro}>
                  <RawHtml
                    type={P}
                    dangerouslySetInnerHTML={{
                      __html: t(`questionnaire/${questionnaireName}/intro`),
                    }}
                  />
                  <br />
                </div>
              </>
            )}
            {(!hideCount || error) && (
              <div
                {...styles.count}
                {...colorScheme.set('backgroundColor', 'default')}
                {...colorScheme.set('borderBottomColor', 'divider')}
                style={{ top: headerHeight }}
              >
                {error ? (
                  <ErrorMessage style={{ margin: 0 }} error={error} />
                ) : (
                  <>
                    <P>
                      <strong>
                        {t('questionnaire/header', {
                          questionCount,
                          userAnswerCount,
                        })}
                      </strong>
                    </P>
                    {questionCount === userAnswerCount ? (
                      <div {...styles.progressIcon}>
                        <CheckCircleIcon
                          size={22}
                          {...colorScheme.set('fill', 'primary')}
                        />
                      </div>
                    ) : updating ? (
                      <div style={{ marginLeft: 5, marginTop: 3 }}>
                        <InlineSpinner size={24} />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}
            <Questions
              questions={questions}
              disabled={userHasSubmitted}
              processSubmit={processSubmit}
              sliceAt={sliceAt}
              showSlice2={showSlice2}
              slug={slug}
            />
            {!externalSubmit && (
              <QuestionnaireActions
                onSubmit={handleSubmit}
                onReset={handleReset}
                updating={updating}
                invalid={userAnswerCount < 1}
              />
            )}
          </div>
        )
      }}
    />
  )
}

const QuestionnaireWithMutations = compose(
  withAuthorization(['supporter', 'editor'], 'showResults'),
  withQuestionnaireMutation,
  withQuestionnaireReset,
  withQuestionnaireRevoke,
)(Questionnaire)

export default QuestionnaireWithMutations

export const QuestionnaireWithData = withQuestionnaire(
  QuestionnaireWithMutations,
)
