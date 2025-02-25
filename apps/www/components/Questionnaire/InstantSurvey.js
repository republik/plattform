import { useState } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { v4 as uuid } from 'uuid'

import {
  Button,
  Interaction,
  plainButtonRule,
  RawHtml,
  mediaQueries,
  useMediaQuery,
  fontFamilies,
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
    padding: '20px 30px',
    [mediaQueries.mUp]: {
      padding: '40px 60px',
    },
  }),
  innerContainer: css({
    paddingTop: 20,
    [mediaQueries.mUp]: {
      paddingTop: 40,
    },
  }),
  buttonContainer: css({
    display: 'flex',
    gap: 10,
    [mediaQueries.mUp]: {
      gap: 20,
    },
  }),
  chartContainer: css({
    gap: 5,
    display: 'flex',
    alignItems: 'center',
  }),
  chartLabel: css({
    flex: '0 0 auto',
  }),
  chartBarContainer: css({
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  }),
  chartBar: css({
    display: 'inline-block',
    height: 25,
    [mediaQueries.mUp]: {
      height: 30,
    },
  }),
  footerContainer: css({
    paddingTop: 20,
    [mediaQueries.mUp]: {
      paddingTop: 40,
    },
  }),
  voteCount: css({
    textAlign: 'center',
    paddingTop: 10,
    [mediaQueries.mUp]: {
      paddingTop: 20,
    },
  }),
}

const Question = ({ question, onSubmit }) => {
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const { id, userAnswer, options } = question
  const answerId = (userAnswer && userAnswer.id) || uuid()
  return (
    <div {...styles.buttonContainer}>
      {options.map((option) => (
        <Button
          key={`${id}-${option.value}`}
          onClick={() => onSubmit(answerId, option.value)}
          small={!isDesktop}
          style={{ flex: '0 0 33%' }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

const AnswersChart = ({ question }) => {
  const {
    turnout: { submitted },
    choiceResults: results,
    userAnswer,
  } = question

  if (!results || submitted === 0) {
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
    <div {...styles.chartContainer}>
      <span
        {...styles.chartLabel}
        style={{
          fontWeight: userAnswerTrue ? 500 : 300,
        }}
      >
        Ja {truePercent}&#8202;%
      </span>
      <span {...styles.chartBarContainer}>
        <span
          {...styles.chartBar}
          style={{ width: `${truePercent}%`, background: '#54FF7E' }}
        />
        <span
          {...styles.chartBar}
          style={{ width: `${falsePercent}%`, background: '#615E5C' }}
        />
      </span>
      <span
        {...styles.chartLabel}
        style={{
          fontWeight: userAnswerFalse ? 500 : 300,
        }}
      >
        Nein {falsePercent}&#8202;%
      </span>
    </div>
  )
}

const Answers = ({ question }) => {
  const { t } = useTranslation()
  const {
    turnout: { submitted },
  } = question

  return (
    <div>
      <AnswersChart question={question} />
      <div style={{ opacity: 0.5 }} {...styles.voteCount}>
        {t.pluralize('instantSurvey/toggle/votes', {
          count: submitted,
        })}
      </div>
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
