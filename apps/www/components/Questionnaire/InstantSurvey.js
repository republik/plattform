import { useState } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { v4 as uuid } from 'uuid'

import {
  Button,
  Interaction,
  plainButtonRule,
  RawHtml,
} from '@project-r/styleguide'

import Loader from '../Loader'
import StatusError from '../StatusError'

import {
  withQuestionnaireAndResults,
  withSurveyAnswerMutation,
} from './enhancers'
import { useTranslation } from 'lib/withT'

const styles = {
  outerContainer: css({
    background: '#F2ECE6',
    padding: '40px 60px',
  }),
  innerContainer: css({
    paddingTop: 40,
  }),
  footerContainer: css({
    paddingTop: 40,
  }),
}

const Question = ({ question, onSubmit }) => {
  const { id, userAnswer, options } = question
  const answerId = (userAnswer && userAnswer.id) || uuid()
  return (
    <div>
      {options.map((option) => (
        <Button
          key={`${id}-${option.value}`}
          onClick={() => onSubmit(answerId, option.value)}
          style={{ marginRight: 20 }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

const Answers = ({ question }) => {
  const {
    turnout: { submitted },
    choiceResults: results,
    userAnswer,
  } = question

  if (!results) {
    return null
  }

  const trueResult = results.find((r) => r.option.value == 'true')
  const falseResult = results.find((r) => r.option.value == 'false')
  const userAnswerTrue = userAnswer && userAnswer.payload.value[0] == 'true'
  const userAnswerFalse = userAnswer && userAnswer.payload.value[0] == 'false'

  const getPercentage = (result) =>
    submitted > 0 ? Math.round((100 / submitted) * result.count) : 0

  const truePercent = getPercentage(trueResult)
  const falsePercent = getPercentage(falseResult)

  return (
    <div>
      <Interaction.P>
        Ja: {truePercent}%{userAnswerTrue ? ' (like you)' : ''}
      </Interaction.P>
      <Interaction.P>
        Nein: {falsePercent}%{userAnswerFalse ? ' (like you)' : ''}
      </Interaction.P>
      <Interaction.P>Turnout: {submitted}</Interaction.P>
    </div>
  )
}

const InstantSurvey = ({
  questionnaireData,
  submitAnswer,
  serverContext,
  slug,
  questionIndex,
}) => {
  const [showResults, setShowResults] = useState(false)
  const { t } = useTranslation()

  const toggleResults = () => setShowResults(!showResults)

  const createSubmitHandler = (question) => (answerId, value) => {
    console.log(Array.from(value))
    const payload = value !== null ? { value: [value] } : null
    submitAnswer(question, payload, answerId)
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
          return <StatusError statusCode={404} serverContext={serverContext} />
        }

        const {
          questionnaire: { questions, userIsEligible },
        } = questionnaireData

        const question = questions.find((q) => q.order === questionIndex)
        const { userAnswer: hasSubmitted, text } = question

        const onSubmit = createSubmitHandler(question)

        return (
          <div {...styles.outerContainer}>
            <Interaction.P style={{ lineHeight: 1.3 }}>
              <b>{text}</b>
            </Interaction.P>
            <div {...styles.innerContainer}>
              {showResults || hasSubmitted || !userIsEligible ? (
                <Answers question={question} />
              ) : (
                <Question onSubmit={onSubmit} question={question} />
              )}
            </div>
            {userIsEligible && !hasSubmitted && (
              <div {...styles.footerContainer}>
                <button
                  {...plainButtonRule}
                  style={{ textDecoration: 'underline' }}
                  onClick={toggleResults}
                >
                  {t(
                    `instantSurvey/toggle/${
                      showResults ? 'question' : 'answers'
                    }`,
                  )}
                </button>
              </div>
            )}
            {!userIsEligible && (
              <div {...styles.footerContainer}>
                <RawHtml
                  dangerouslySetInnerHTML={{
                    __html: t('instantSurvey/login'),
                  }}
                />
              </div>
            )}
          </div>
        )
      }}
    />
  )
}

const InstantSurveyWithData = compose(
  withQuestionnaireAndResults,
  withSurveyAnswerMutation,
)(InstantSurvey)

export default InstantSurveyWithData
