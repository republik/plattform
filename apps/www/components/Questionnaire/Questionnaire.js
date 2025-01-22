import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  Interaction,
  InlineSpinner,
  RawHtml,
  useHeaderHeight,
  FieldSet,
  useColorContext,
  colors,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

import { withMyDetails, withMyDetailsMutation } from '../Account/enhancers'
import DetailsForm from '../Account/DetailsForm'
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

const { Headline, P } = Interaction

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
    detailsData,
    submittedMessage,
    SubmittedComponent,
    questionnaireName,
    context,
    sliceAt,
    showSlice2,
    slug,
    updateDetails,
    externalSubmit = false,
    publicSubmission = true,
    hideCount = false,
    hideInvalid = false,
    hideReset = false,
    requireName = true,
    showAnonymize = false,
    redirectPath,
    notEligibleCopy,
  } = props

  const [state, setState] = useState({})
  const router = useRouter()
  const [isResubmitAnswers, setIsResubmitAnswers] = useState(false)
  const [headerHeight] = useHeaderHeight()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const id = questionnaireData?.questionnaire?.id
  const [detailsState, setDetailsState] = useState({
    showErrors: false,
    values: {},
    errors: {},
    dirty: {},
  })

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

        if (!userIsEligible && notEligibleCopy) {
          return (
            <Box style={{ padding: 15 }}>
              <RawHtml
                type={Interaction.P}
                dangerouslySetInnerHTML={{
                  __html: notEligibleCopy,
                }}
              />
            </Box>
          )
        }
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
          requireName &&
          (!detailsData.me?.firstName || !detailsData.me?.lastName)
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
          if (redirectPath) {
            redirectToPath()
          } else {
            processSubmit(submitQuestionnaire, id)
          }
        }

        const onSubmitAnonymized = () =>
          processSubmit(anonymizeQuestionnaire, id)

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
              questions={questions}
              disabled={userHasSubmitted}
              processSubmit={processSubmit}
              sliceAt={sliceAt}
              showSlice2={showSlice2}
              slug={slug}
            />
            {needsMeUpdate && (
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
                onSubmitAnonymized={onSubmitAnonymized}
                showAnonymize={showAnonymize}
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
  withQuestionnaireAnonymize,
  withMyDetails,
  withMyDetailsMutation,
)(Questionnaire)

export default QuestionnaireWithMutations

export const QuestionnaireWithData = withQuestionnaire(
  QuestionnaireWithMutations,
)
