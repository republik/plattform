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
  FieldSet,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

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
import DetailsForm from '../Account/DetailsForm'
import { withMyDetails, withMyDetailsMutation } from '../Account/enhancers'

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
    detailsData,
    publicSubmission = true,
    hideInvalid,
    hideReset,
    context,
  } = props
  const [state, setState] = useState({})
  const [isResubmitAnswers, setIsResubmitAnswers] = useState(false)
  const [headerHeight] = useHeaderHeight()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const id = questionnaireData.questionnaire?.id
  const [detailsState, setDetailsState] = useState({
    showErrors: false,
    values: {},
    errors: {},
    dirty: {},
  })

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

  const {
    submittedMessage,
    questionnaireName,
    externalSubmit,
    hideCount,
    sliceAt,
    showSlice2,
    slug,
    updateDetails,
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
            userIsEligible,
          },
        } = questionnaireData
        const error = state.error || props.error
        const updating = state.updating || props.updating || props.submitting

        if (!userIsEligible) {
          return null
        }
        if (!updating && userHasSubmitted && submittedMessage) {
          return submittedMessage
        }

        // ToDo: expose & query questionnaire.submissionsAccessRole

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
        const onRevoke =
          revokeSubmissions &&
          (() => {
            processSubmit(revokeQuestionnaire, id)
          })

        if (!updating && !isResubmitAnswers && (hasEnded || userHasSubmitted)) {
          return (
            <QuestionnaireClosed
              submitted={userHasSubmitted}
              onResubmit={
                resubmitAnswers &&
                (() => {
                  setIsResubmitAnswers(true)
                })
              }
              onRevoke={onRevoke}
              publicSubmission={publicSubmission}
              context={context}
            />
          )
        }
        // handle questions
        const questionCount = questions
          .filter((q) => !q.private)
          .filter(Boolean).length
        const userAnswerCount = questions
          .map((q) => !q.private && q.userAnswer)
          .filter(Boolean).length
        const askForAddress = questions.some((q) => {
          const value = q.userAnswer?.payload?.value

          return (
            value &&
            q.options?.some(
              (option) => option.requireAddress && value.includes(option.value),
            )
          )
        })
        const askForName =
          !detailsData.me?.firstName || !detailsData.me?.lastName
        const needsMeUpdate = askForName || askForAddress

        const detailsErrorMessages = Object.keys(detailsState.errors)
          .map((key) => detailsState.errors[key])
          .filter(Boolean)

        const onSubmit = async () => {
          if (needsMeUpdate && detailsErrorMessages.length) {
            setDetailsState((state) =>
              Object.keys(state.errors).reduce(
                (nextState, key) => {
                  nextState.dirty[key] = true
                  return nextState
                },
                {
                  ...state,
                  showErrors: true,
                  dirty: {},
                },
              ),
            )
            return
          }
          if (isResubmitAnswers) {
            setIsResubmitAnswers(false)
          }
          if (needsMeUpdate) {
            setState({ updating: true })
            try {
              await updateDetails({
                ...(askForName
                  ? {
                      firstName: detailsState.values.firstName,
                      lastName: detailsState.values.lastName,
                    }
                  : {}),
                address: askForAddress
                  ? {
                      name: detailsState.values.name,
                      line1: detailsState.values.line1,
                      line2: detailsState.values.line2,
                      postalCode: detailsState.values.postalCode,
                      city: detailsState.values.city,
                      country: detailsState.values.country,
                    }
                  : undefined,
              })
            } catch (error) {
              setState({
                error,
              })
              return
            }
          }
          processSubmit(submitQuestionnaire, id)
        }

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
            {context !== 'postcard' &&
              context !== 'climatepersonalinfo' &&
              needsMeUpdate && (
                <DetailsForm
                  style={{ marginTop: 50 }}
                  data={detailsData}
                  values={detailsState.values}
                  errors={detailsState.errors}
                  dirty={detailsState.dirty}
                  onChange={(fields) => {
                    setDetailsState(FieldSet.utils.mergeFields(fields))
                  }}
                  errorMessages={detailsErrorMessages}
                  showErrors={!updating && !!detailsState.showErrors}
                  askForName={askForName}
                  askForAddress={askForAddress}
                />
              )}
            {!externalSubmit && (
              <QuestionnaireActions
                isResubmitAnswers={isResubmitAnswers}
                onSubmit={onSubmit}
                onReset={!hideReset && onReset}
                updating={updating}
                invalid={userAnswerCount < 1}
                publicSubmission={publicSubmission}
                hideInvalid={hideInvalid}
                context={context}
              />
            )}
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
  withMyDetails,
  withMyDetailsMutation,
)(Questionnaire)

export default QuestionnaireWithMutations

export const QuestionnaireWithData = withQuestionnaire(
  QuestionnaireWithMutations,
)
