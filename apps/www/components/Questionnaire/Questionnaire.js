import { useState } from 'react'
import Loader from '../Loader'

import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { CheckCircleIcon } from '@project-r/styleguide'

import {
  colors,
  Interaction,
  InlineSpinner,
  RawHtml,
  useHeaderHeight,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import withAuthorization from '../Auth/withAuthorization'
import StatusError from '../StatusError'
import { withQuestionnaireMutation, withQuestionnaireReset } from './enhancers'
import Questions from './Questions'
import QuestionnaireClosed from './QuestionnaireClosed'
import QuestionnaireActions from './QuestionnaireActions'
import { useRouter } from 'next/router'
import ErrorMessage from '../ErrorMessage'

const { Headline, P } = Interaction

const styles = {
  intro: css({
    marginTop: 35,
  }),
  count: css({
    background: '#fff',
    zIndex: 10,
    position: 'sticky',
    padding: '10px 0',
    borderBottom: `0.5px solid ${colors.divider}`,
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
    onQuestionnaireChange,
  } = props
  const [state, setState] = useState({})
  const [headerHeight] = useHeaderHeight()
  const { t } = useTranslation()
  const router = useRouter()

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
    const {
      questionnaire: { id },
    } = questionnaireData
    processSubmit(submitQuestionnaire, id).then(() =>
      router.push('/meta').then(() => window.scrollTo(0, 0)),
    )
  }

  const handleReset = (e) => {
    const {
      questionnaire: { id },
    } = questionnaireData
    e.preventDefault()
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
          questionnaire: { userHasSubmitted, questions },
        } = questionnaireData
        const error = state.error || props.error
        const updating = state.updating || props.updating || props.submitting

        if (!updating && userHasSubmitted && submittedMessage) {
          return submittedMessage
        }

        if (!updating && (hasEnded || userHasSubmitted)) {
          return (
            <QuestionnaireClosed
              submitted={userHasSubmitted}
              showResults={showResults}
              slug={slug}
            />
          )
        }

        // handle questions
        const questionCount = questions.filter(Boolean).length
        const userAnswerCount = questions
          .map((q) => q.userAnswer)
          .filter(Boolean).length
        const questionnairePath = questionnaireName
          ? `/${questionnaireName}/`
          : '/'
        return (
          <div>
            <Headline>{t(`questionnaire${questionnairePath}title`)}</Headline>
            <div {...styles.intro}>
              <RawHtml
                type={P}
                dangerouslySetInnerHTML={{
                  __html: t(`questionnaire${questionnairePath}intro`),
                }}
              />
              <br />
            </div>
            {hideCount && error && (
              <div {...styles.count} style={{ top: headerHeight }}>
                <ErrorMessage style={{ margin: 0 }} error={error} />
              </div>
            )}
            {!hideCount && (
              <div {...styles.count} style={{ top: headerHeight }}>
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
                        <CheckCircleIcon size={22} color={colors.primary} />
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

export default compose(
  withAuthorization(['supporter', 'editor'], 'showResults'),
  withQuestionnaireMutation,
  withQuestionnaireReset,
)(Questionnaire)
