import { useState } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { v4 as uuid } from 'uuid'

import { Button, Interaction } from '@project-r/styleguide'

import Loader from '../Loader'
import StatusError from '../StatusError'

import {
  withQuestionnaireAndResults,
  withSurveyAnswerMutation,
} from './enhancers'
import { NotEligible } from './Questionnaire'

export const actionStyles = css({
  textAlign: 'center',
  margin: '20px auto 20px auto',
})

const Question = ({ question, onSubmit }) => {
  const { id, text, userAnswer, options } = question
  const answerId = (userAnswer && userAnswer.id) || uuid()
  return (
    <div>
      <Interaction.P>{text}</Interaction.P>
      <div>
        {options.map((option) => (
          <div key={`${id}-${option.value}`}>
            <Button onClick={() => onSubmit(answerId, option.value)}>
              {option.label}
            </Button>
          </div>
        ))}
      </div>
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
  notEligibleCopy,
}) => {
  const [showResults, setShowResults] = useState(false)

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

        console.log(questionnaireData)

        if (!userIsEligible) {
          return <NotEligible notEligibleCopy={notEligibleCopy} />
        }

        const question = questions.find((q) => q.order === questionIndex)
        const hasSubmitted = question.userAnswer

        const onSubmit = createSubmitHandler(question)

        return (
          <div>
            {showResults || hasSubmitted ? (
              <Answers question={question} />
            ) : (
              <Question onSubmit={onSubmit} question={question} />
            )}
            {!hasSubmitted && (
              <Button onClick={toggleResults}>
                {showResults ? 'Frage beantworten' : 'Antworten anzeigen'}
              </Button>
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
