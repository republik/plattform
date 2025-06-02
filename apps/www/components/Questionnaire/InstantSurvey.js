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
  InlineSpinner,
  ColorContextLocalExtension,
  useColorContext,
  inQuotes,
} from '@project-r/styleguide'

import Loader from '../Loader'
import StatusError from '../StatusError'

import {
  withQuestionnaireAndResults,
  withSurveyAnswerMutation,
} from './enhancers'
import { useTranslation } from 'lib/withT'

const localColors = {
  light: { background: '#F2ECE6', data1: '#54FF7E', data2: '#615E5C' },
  dark: { background: '#444546', data1: '#54FF7E', data2: '#DBDBDB' },
}

const styles = {
  outerContainer: css({
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
    position: 'relative',
    '&::before': {
      content: '""',
      display: 'block',
      width: 1,
      height: 37,
      position: 'absolute',
      left: 'calc(50% - 1px)',
      borderRight: '1px dashed black',
      [mediaQueries.mUp]: {
        height: 44,
      },
    },
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
    paddingTop: 20,
    [mediaQueries.mUp]: {
      paddingTop: 30,
    },
  }),
  spinnerContainer: css({
    textAlign: 'center',
    padding: 10,
    [mediaQueries.mUp]: {
      padding: 20,
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
  const [colorScheme] = useColorContext()
  const {
    turnout: { submitted },
    choiceResults: results,
  } = question

  if (!results || submitted === 0) {
    return null
  }

  const trueResult = results.find((r) => r.option.value == 'true')
  const falseResult = results.find((r) => r.option.value == 'false')
  const trueLabel = trueResult.option.label
  const falseLabel = falseResult.option.label

  const getPercentage = (result) =>
    submitted > 0 ? Math.round((100 / submitted) * result.count) : 0

  const truePercent = getPercentage(trueResult)
  const falsePercent = getPercentage(falseResult)
  return (
    <div {...styles.chartContainer}>
      <span
        {...styles.chartLabel}
        style={{
          fontWeight: truePercent > falsePercent ? 500 : 300,
        }}
      >
        {trueLabel} {truePercent}&#8202;%
      </span>
      <div {...styles.chartBarContainer}>
        <div
          {...styles.chartBar}
          {...colorScheme.set('background', 'data1')}
          style={{ width: `${truePercent}%` }}
        />
        <div
          {...styles.chartBar}
          {...colorScheme.set('background', 'data2')}
          style={{ width: `${falsePercent}%` }}
        />
      </div>
      <span
        {...styles.chartLabel}
        style={{
          fontWeight: falsePercent > truePercent ? 500 : 300,
        }}
      >
        {falseLabel} {falsePercent}&#8202;%
      </span>
    </div>
  )
}

const Answers = ({ question }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const {
    turnout: { submitted },
    userAnswer,
    options,
  } = question

  const answerLabel = options.find(
    (o) => o.value === userAnswer?.payload?.value[0],
  )?.label

  return (
    <div>
      <AnswersChart question={question} />
      <div {...styles.voteCount} {...colorScheme.set('color', 'textSoft')}>
        {t.pluralize('instantSurvey/toggle/votes', {
          count: submitted,
        })}
        {answerLabel && <span> – Ihre Stimme: {inQuotes(answerLabel)}</span>}
      </div>
    </div>
  )
}

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}

const InstantSurvey = ({
  questionnaireData,
  submitAnswer,
  serverContext,
  slug, // needed for query
  questionIndex,
}) => {
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()

  const toggleResults = () => setShowResults(!showResults)

  const createSubmitHandler = (question) => (answerId, value) => {
    setSubmitting(true)
    const payload = value !== null ? { value: [value] } : null
    submitAnswer(question, payload, answerId).then(() => {
      setSubmitting(false)
    })
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
          <ColorContextLocalExtension localColors={localColors}>
            <GetColorScheme>
              {(colorScheme) => (
                <div
                  {...styles.outerContainer}
                  {...colorScheme.set('background', 'background')}
                >
                  <Interaction.P style={{ lineHeight: 1.3 }}>
                    <b>{text}</b>
                  </Interaction.P>
                  <div {...styles.innerContainer}>
                    {submitting ? (
                      <div {...styles.spinnerContainer}>
                        <InlineSpinner />
                      </div>
                    ) : showResults || hasSubmitted || !userIsEligible ? (
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
              )}
            </GetColorScheme>
          </ColorContextLocalExtension>
        )
      }}
    />
  )
}

const InstantSurveyWithData = compose(
  withSurveyAnswerMutation,
  withQuestionnaireAndResults,
)(InstantSurvey)

export default InstantSurveyWithData
