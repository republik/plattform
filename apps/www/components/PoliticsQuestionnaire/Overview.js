import { css } from 'glamor'
import { csv, nest } from 'd3'
import { useEffect, useState } from 'react'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import Link from 'next/link'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
  Container,
} from '@project-r/styleguide'

import { questionColor, QUESTION_TYPES, leftJoin } from './config'
import { QuestionSummaryChart } from '../Questionnaire/Submissions/QuestionChart'

// re-introduced since actionbar/article only expect a single share param
// (otherwise share for multiple questions fails)
export const QUESTION_SEPARATOR = ','

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

const SubmissionsOverview = ({ extract }) => {
  const [submissionData, setSubmissionData] = useState([])
  useEffect(() => {
    csv(
      `${PUBLIC_BASE_URL}/static/politicsquestionnaire2023/submissions_dummy_data.csv`,
    ).then((data) => {
      const joinedData = leftJoin(data, QUESTION_TYPES, 'questionSlug')
      const groupedData = nest()
        .key((d) => d.question)
        .entries(joinedData)

      return setSubmissionData(groupedData)
    })
  }, [])

  // the extract flag is only used for custom share for in the QuestionView
  if (extract) return null

  return (
    <div style={{ margin: '48px auto 0' }}>
      {submissionData.map((question, idx) => (
        <QuestionFeatured
          key={question.key}
          questionSlug={question.values[0].questionSlug}
          questionType={question.values[0].type}
          question={question}
          bgColor={questionColor(idx)}
        />
      ))}
    </div>
  )
}

export default SubmissionsOverview

const QuestionFeatured = ({
  question,
  bgColor,
  questionSlug,
  questionType,
}) => {
  // const router = useRouter()
  // const { query } = router

  // const questionRef = useRef()
  // useEffect(() => {
  //   if (query?.focus === questions[0].id) {
  //     scrollIntoView(questionRef.current)
  //   }
  // }, [])

  return (
    <div
      // ref={questionRef}
      // id={questions[0].id}
      style={{
        padding: '0 0 46px 0',
        // flexBasis: '50%',
        backgroundColor: bgColor,
        display: 'flex',
      }}
    >
      <Container>
        {questionType === 'text' ? (
          <AnswerGridOverview question={question} />
        ) : (
          <AnswersChart question={question} />
        )}

        {questionType === 'text' && (
          <NarrowContainer>
            <Interaction.P style={{ textAlign: 'center' }}>
              <QuestionLink questionSlug={questionSlug}>
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Interaction.P>
          </NarrowContainer>
        )}
      </Container>
    </div>
  )
}

const AnswerGridOverview = ({ question }) => {
  return (
    <>
      <NarrowContainer>
        <Editorial.Subhead style={{ textAlign: 'center' }}>
          {question.key}
        </Editorial.Subhead>
        {/* {hint && (
          <Interaction.P style={{ textAlign: 'center', fontSize: '1em' }}>
            {hint}
          </Interaction.P>
        )} */}
      </NarrowContainer>
      <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
        <AnswersGrid>
          {question.values.map(({ uuid, answer, name }) => (
            <AnswersGridCard key={uuid}>
              <SubmissionLink id={uuid}>
                <a style={{ textDecoration: 'none' }}>
                  <div {...styles.answerCard}>
                    <div>
                      <Editorial.Question style={{ marginTop: 0 }}>
                        {inQuotes(answer)}
                      </Editorial.Question>
                      <Editorial.Credit
                        style={{
                          marginTop: '0',
                          paddingTop: '20px',
                        }}
                      >
                        Von{' '}
                        <span style={{ textDecoration: 'underline' }}>
                          {name}
                        </span>
                      </Editorial.Credit>
                    </div>
                  </div>
                </a>
              </SubmissionLink>
            </AnswersGridCard>
          ))}
        </AnswersGrid>
      </ColorContextProvider>
    </>
  )
}

export const QuestionLink = ({ questionSlug, children }) => {
  return (
    <Link href={`/politikfragebogen/frage/${questionSlug}`} passHref>
      {children}
    </Link>
  )
}

export const SubmissionLink = ({ id, children }) => {
  return (
    <Link href={`/politikfragebogen/${id}`} passHref>
      {children}
    </Link>
  )
}

const AnswersChart = ({ question, skipTitle }) => {
  const totalAnswers = question.values.length
  const values = question.values[0].options.map((option) => ({
    answer: option,
    value:
      question.values.filter((result) => result.answer === option).length ??
      0 / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: 20 }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.key}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart answers={values} key='answer' />
        </div>
      </div>
    </NarrowContainer>
  )
}

const styles = {
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }),
}
