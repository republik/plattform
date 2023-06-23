import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Frame from '../Frame'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
  Container,
} from '@project-r/styleguide'

import {
  questionColor,
  QUESTIONS,
  QUESTIONNAIRE_SQUARE_IMG_URL,
} from './config'
import { QuestionSummaryChart } from '../Questionnaire/Submissions/QuestionChart'
import { PUBLIC_BASE_URL, ASSETS_SERVER_BASE_URL } from '../../lib/constants'

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

export const SubmissionsOverview = ({ submissionData }) => {
  return (
    <Frame raw>
      <div style={{ margin: '48px auto 0' }}>
        {QUESTIONS.map((question, idx) => {
          const groupQuestions = question.questionSlugs.map((slug) =>
            submissionData.find((d) => d.key === slug),
          )

          return (
            <QuestionFeatured
              key={groupQuestions[0].key}
              questionSlug={groupQuestions[0].values[0].questionSlug}
              questionType={groupQuestions[0].values[0].type}
              question={groupQuestions[0]}
              bgColor={questionColor(idx)}
            />
          )
        })}
      </div>
    </Frame>
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
