import { Component } from 'react';
import Loader from '../Loader'

import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { CheckCircleIcon } from '@project-r/styleguide'

import {
  colors,
  Interaction,
  mediaQueries,
  InlineSpinner,
  RawHtml,
} from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'
import withT from '../../lib/withT'
import withAuthorization from '../Auth/withAuthorization'
import StatusError from '../StatusError'
import { withQuestionnaireMutation, withQuestionnaireReset } from './enhancers'
import Questions from './Questions'
import QuestionnaireClosed from './QuestionnaireClosed'
import QuestionnaireActions from './QuestionnaireActions'
import { withRouter } from 'next/router'
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
    top: HEADER_HEIGHT - 1,
    [mediaQueries.onlyS]: {
      top: HEADER_HEIGHT_MOBILE - 1,
    },
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

class Questionnaire extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  processSubmit = (fn, ...args) => {
    const { onQuestionnaireChange } = this.props
    this.setState({ updating: true })
    return fn(...args)
      .then(() => {
        onQuestionnaireChange && onQuestionnaireChange()
        return this.setState(() => ({
          updating: false,
          error: null,
        }))
      })
      .catch((error) => {
        this.setState(() => ({
          updating: false,
          submitting: false,
          error,
        }))
      })
  }

  handleSubmit = () => {
    this.setState({ submitting: true })
    const {
      submitQuestionnaire,
      questionnaireData: {
        questionnaire: { id },
      },
      router,
    } = this.props
    this.processSubmit(submitQuestionnaire, id).then(() =>
      router.push('/meta').then(() => window.scrollTo(0, 0)),
    )
  }

  handleReset = (e) => {
    const {
      resetQuestionnaire,
      questionnaireData: {
        questionnaire: { id },
      },
    } = this.props
    e.preventDefault()
    this.processSubmit(resetQuestionnaire, id).then(() => window.scrollTo(0, 0))
  }

  render() {
    const {
      questionnaireData,
      t,
      showResults,
      submittedMessage,
      questionnaireName,
      externalSubmit,
      hideCount,
      sliceAt,
      showSlice2,
      slug,
    } = this.props

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
              <StatusError
                statusCode={404}
                serverContext={this.props.serverContext}
              />
            )
          }

          const hasEnded =
            now > new Date(questionnaireData.questionnaire.endDate)

          // handle already submitted
          const {
            questionnaire: { userHasSubmitted, questions },
          } = questionnaireData
          const error = this.state.error || this.props.error
          const submitting = this.state.submitting || this.props.submitting
          const updating = this.state.updating || this.props.updating

          if (!submitting && userHasSubmitted && submittedMessage) {
            return submittedMessage
          }

          if (!submitting && (hasEnded || userHasSubmitted)) {
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
                <div {...styles.count}>
                  <ErrorMessage style={{ margin: 0 }} error={error} />
                </div>
              )}
              {!hideCount && (
                <div {...styles.count}>
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
                      ) : updating || submitting ? (
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
                processSubmit={this.processSubmit}
                sliceAt={sliceAt}
                showSlice2={showSlice2}
                slug={slug}
              />
              {!externalSubmit && (
                <QuestionnaireActions
                  onSubmit={this.handleSubmit}
                  onReset={this.handleReset}
                  updating={updating}
                  submitting={submitting}
                  invalid={userAnswerCount < 1}
                />
              )}
            </div>
          )
        }}
      />
    )
  }
}

export default compose(
  withT,
  withRouter,
  withAuthorization(['supporter', 'editor'], 'showResults'),
  withQuestionnaireMutation,
  withQuestionnaireReset,
)(Questionnaire)
