import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  Interaction,
  RawHtml,
  useHeaderHeight,
  useColorContext,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

import { withMyDetails, withMyDetailsMutation } from '../Account/enhancers'
import ErrorMessage from '../ErrorMessage'
import Box from '../Frame/Box'
import Loader from '../Loader'
import StatusError from '../StatusError'

import {
  withQuestionnaire,
  withQuestionnaireMutation,
  withQuestionnaireReset,
  withQuestionnaireRevoke,
  withQuestionnaireAnonymize,
} from './enhancers'
import Questions from './Questions'
import QuestionnaireClosed from './QuestionnaireClosed'
import QuestionnaireActions from './QuestionnaireActions'
import { IconCheckCircle } from '@republik/icons'

const { P } = Interaction

const styles = {
  intro: css({
    marginTop: 35,
  }),
  count: css({
    zIndex: 10,
    position: 'sticky',
    paddingTop: 5,
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: 40,
    alignItems: 'center',
  }),
  countIcon: css({
    marginLeft: 5,
  }),
  countBarContainer: css({
    flex: '0 0 100%',
    height: 2,
    marginTop: 5,
  }),
  countBar: css({
    height: 2,
    transition: 'width 0.3s ease',
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
    anonymizeQuestionnaire,
    onQuestionnaireChange,
    submittedMessage,
    SubmittedComponent,
    context,
    slug,
    publicSubmission = true,
    hideCount = false,
    hideInvalid = false,
    hideReset = false,
    showAnonymize = false,
    redirectPath,
    notEligibleCopy = 'Not elligible', // TODO
  } = props

  const [state, setState] = useState({})
  const router = useRouter()
  const [isResubmitAnswers, setIsResubmitAnswers] = useState(false)
  const [headerHeight] = useHeaderHeight()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const id = questionnaireData?.questionnaire?.id

  const onSubmitSuccess = () => {
    if (onQuestionnaireChange) {
      onQuestionnaireChange()
    }
    return setState({
      updating: false,
    })
  }

  const onSubmitError = (error) => {
    setState({
      updating: false,
      error,
    })
  }

  const processSubmit = (fn, ...args) => {
    setState({ updating: true })
    return fn(...args)
      .then(onSubmitSuccess)
      .catch(onSubmitError)
  }

  const redirectToPath = () => {
    setState({ updating: true })
    submitQuestionnaire(id)
      .then(({ data }) => {
        router.replace({
          pathname: redirectPath.replace(
            '{id}',
            data?.submitQuestionnaire?.userSubmissionId,
          ),
        })
      })
      .catch(onSubmitError)
  }

  return (
    <Loader
      loading={questionnaireData.loading}
      error={questionnaireData.error}
      render={() => {
        const now = new Date()
        // handle not found or not started
        if (
          !questionnaireData?.questionnaire ||
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
            userIsEligible,
          },
        } = questionnaireData
        const error = state.error || props.error
        const updating = state.updating || props.updating || props.submitting
        const hasUserAnswers = questions.some(({ userAnswer }) => !!userAnswer)

        if (!userIsEligible) {
          return (
            <Box style={{ padding: 15 }}>
              <RawHtml
                type={Interaction.P}
                dangerouslySetInnerHTML={{
                  __html: notEligibleCopy || 'TODO',
                }}
              />
            </Box>
          )
        }
        if (!updating && userHasSubmitted && submittedMessage) {
          return submittedMessage
        }

        const onReset = async () => {
          setState({ updating: true })
          if (revokeSubmissions && userHasSubmitted) {
            await revokeQuestionnaire(id).catch((error) => {
              setState({
                error,
              })
            })
          }
          await resetQuestionnaire(id).catch((error) => {
            setState({
              error,
            })
          })
          if (isResubmitAnswers) {
            setIsResubmitAnswers(false)
          }
          setState((state) => ({
            // preserve error if present
            ...state,
            updating: false,
          }))
        }

        const onResubmit = resubmitAnswers && (() => setIsResubmitAnswers(true))

        const onRevoke =
          revokeSubmissions &&
          hasUserAnswers &&
          (() => processSubmit(revokeQuestionnaire, id))

        if (
          !updating &&
          !isResubmitAnswers &&
          userHasSubmitted &&
          SubmittedComponent
        ) {
          return (
            <SubmittedComponent
              questionnaire={questionnaireData.questionnaire}
              onResubmit={onResubmit}
              onRevoke={onRevoke}
            />
          )
        }
        if (!updating && !isResubmitAnswers && (hasEnded || userHasSubmitted)) {
          if (redirectPath && resubmitAnswers) {
            onResubmit()
          } else {
            return (
              <QuestionnaireClosed
                submitted={userHasSubmitted}
                onResubmit={onResubmit}
                onRevoke={onRevoke}
                publicSubmission={publicSubmission}
              />
            )
          }
        }

        const onSubmit = async () => {
          if (isResubmitAnswers) {
            setIsResubmitAnswers(false)
          }
          if (redirectPath) {
            redirectToPath()
          } else {
            processSubmit(submitQuestionnaire, id)
          }
        }
        const onSubmitAnonymized = () =>
          processSubmit(anonymizeQuestionnaire, id)

        // handle questions
        const questionCount = questions
          .filter((q) => !q.private)
          .filter(Boolean).length
        const userAnswerCount = questions
          .map((q) => !q.private && q.userAnswer)
          .filter(Boolean).length

        return (
          <div>
            {(!hideCount || error) && (
              <div
                {...styles.count}
                {...colorScheme.set('backgroundColor', 'default')}
                style={{ top: headerHeight }}
              >
                {error ? (
                  <ErrorMessage style={{ margin: 0 }} error={error} />
                ) : (
                  <>
                    <P>
                      <small>
                        {t('questionnaire/header', {
                          questionCount,
                          userAnswerCount,
                        })}
                      </small>
                    </P>
                    {questionCount === userAnswerCount && (
                      <div {...styles.countIcon}>
                        <IconCheckCircle
                          size={16}
                          {...colorScheme.set('fill', 'primary')}
                        />
                      </div>
                    )}
                  </>
                )}
                <div
                  {...styles.countBarContainer}
                  {...colorScheme.set('background', 'divider')}
                >
                  <div
                    {...styles.countBar}
                    {...colorScheme.set('background', 'primary')}
                    style={{
                      width: `${(userAnswerCount / questionCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <Questions
              slug={slug}
              questions={questions}
              questionCount={questionCount}
              disabled={userHasSubmitted}
              processSubmit={processSubmit}
            />
            <QuestionnaireActions
              isResubmitAnswers={isResubmitAnswers}
              onSubmit={onSubmit}
              onSubmitAnonymized={onSubmitAnonymized}
              showAnonymize={showAnonymize}
              onReset={!hideReset && onReset}
              updating={updating}
              invalid={userAnswerCount < 1}
              publicSubmission={publicSubmission}
              hideInvalid={hideInvalid}
              context={context}
            />
          </div>
        )
      }}
    />
  )
}

const QuestionnaireWithMutations = compose(
  withQuestionnaireMutation,
  withQuestionnaireReset,
  withQuestionnaireRevoke,
  withQuestionnaireAnonymize,
  withMyDetails,
  withMyDetailsMutation,
)(Questionnaire)

export default QuestionnaireWithMutations

export const QuestionnaireWithData = withQuestionnaire(
  QuestionnaireWithMutations,
)
