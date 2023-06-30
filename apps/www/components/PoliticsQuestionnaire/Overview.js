import { css } from 'glamor'
import Link from 'next/link'
import { useState } from 'react'

import Frame from '../Frame'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
  Container,
  Dropdown,
} from '@project-r/styleguide'

import {
  questionColor,
  QUESTIONS,
  QUESTION_TYPES,
  QUESTION_SEPARATOR,
} from './config'
import { QuestionSummaryChart } from '../Questionnaire/Submissions/QuestionChart'

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

// filter needs to be this text/value object
const CANTONS = [
  { text: 'Alle', value: undefined },
  { text: 'Bern', value: 'BE' },
  { text: 'Wallis', value: 'VS' },
  { text: 'Zug', value: 'ZG' },
]

// @Felix: if you prefer I guess a filter context could be a good solution, too
// @Felix: i'd use this in the single question view too
export const Filters = ({ canton, setCanton }) => (
  <NarrowContainer>
    <Dropdown
      label='Kanton'
      items={CANTONS}
      value={canton}
      onChange={(item) => {
        setCanton(item)
      }}
    />
  </NarrowContainer>
)

export const SubmissionsOverview = ({ submissionData }) => {
  // @Felix: it would be cool to also set a query param for the filters, then we
  //  can open the single answer pages with the right filters, as well as share prefiltered pages
  // @Felix mechanics for partei filter would be exactly the same
  const [canton, setCanton] = useState(CANTONS[0])
  return (
    <Frame raw>
      <div style={{ margin: '48px auto 0' }}>
        <Filters canton={canton} setCanton={setCanton} />
        {QUESTIONS.map((question, idx) => {
          const groupQuestions = question.questionSlugs.map((slug) =>
            submissionData.find((d) => d.key === slug),
          )

          return (
            <QuestionFeatured
              key={question.questionSlugs[0]}
              questions={groupQuestions}
              bgColor={questionColor(idx)}
              canton={canton}
            />
          )
        })}
      </div>
    </Frame>
  )
}

export default SubmissionsOverview

export const getTypeBySlug = (slug) =>
  QUESTION_TYPES.find((q) => q.questionSlug === slug).type

const getAnswerLenghtBySlug = (slug) =>
  QUESTION_TYPES.find((q) => q.questionSlug === slug).answerLength

const QuestionFeatured = ({ questions, bgColor, questionSlug, canton }) => {
  // const router = useRouter()
  // const { query } = router

  // const questionRef = useRef()
  // useEffect(() => {
  //   if (query?.focus === questions[0].id) {
  //     scrollIntoView(questionRef.current)
  //   }
  // }, [])

  const questionTypes = questions.map((q) => getTypeBySlug(q.key))

  const hasTextAnswer = questionTypes.includes('text')

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
        {questions.map((q) => {
          return getTypeBySlug(q.key) === 'text' ? (
            <AnswerGridOverview question={q} canton={canton} />
          ) : getTypeBySlug(q.key) === 'choice' ? (
            <AnswersChart question={q} canton={canton} />
          ) : null
        })}

        {hasTextAnswer && (
          <NarrowContainer>
            <Interaction.P style={{ textAlign: 'center' }}>
              <QuestionLink questions={questions}>
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Interaction.P>
          </NarrowContainer>
        )}
      </Container>
    </div>
  )
}

const AnswerGridOverview = ({ question, canton }) => {
  const questionSlug = question.key
  return (
    <>
      <NarrowContainer>
        <Editorial.Subhead style={{ textAlign: 'center' }}>
          {question.values[0].question}
        </Editorial.Subhead>
        {/* {hint && (
          <Interaction.P style={{ textAlign: 'center', fontSize: '1em' }}>
            {hint}
          </Interaction.P>
        )} */}
      </NarrowContainer>
      <ColorContextProvider localColorVariables={colors} colorSchemeKey='light'>
        <AnswersGrid>
          {question.values
            .filter(({ answer, canton: answerCanton }) => {
              return (
                // @Felix: this could be made a bit more elegant, but you catch the gist
                (canton.value ? answerCanton === canton.value : true) &&
                // @Felix: answer length this seems to be available with answerLength.min/max
                answer.length > getAnswerLenghtBySlug(question.key)?.min &&
                answer.length < getAnswerLenghtBySlug(question.key)?.max
              )
            })
            .map(({ uuid, answer, name }) => (
              <AnswersGridCard key={`${questionSlug}-${uuid}`}>
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

export const QuestionLink = ({ questions, children }) => {
  const link = questions.map((q) => q.key).join(QUESTION_SEPARATOR)
  return (
    <Link href={`/politikfragebogen/frage/${link}`} passHref>
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

// @Felix: for the filter to work here we need more detailed data
//  (i.e. individual answers, which we can filter and aggregate ourselves
//  here depending of the value of the filters)
const AnswersChart = ({ question, skipTitle, canton }) => {
  const options = question.values[0].options

  const validAnswers = question.values.filter((item) =>
    options.includes(item.answer),
  )

  const totalAnswers = validAnswers.length
  const values = options.map((option) => ({
    answer: option,
    value:
      (question.values.filter((result) => result.answer === option).length ??
        0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: 20 }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.values[0].question}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart
            answers={values.filter((item) => true)}
            key='answer'
          />
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
