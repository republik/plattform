import { css } from 'glamor'
import { csv, nest } from 'd3'
import { useEffect, useState } from 'react'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import Link from 'next/link'
import { useRouter } from 'next/router'

import {
  ColorContextProvider,
  colors,
  Editorial,
  inQuotes,
  Interaction,
  NarrowContainer,
  Container,
} from '@project-r/styleguide'

import { questionColor } from './config'

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
      const groupedData = nest()
        .key((d) => d.questions)
        .entries(data)

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
          question={question}
          bgColor={questionColor(idx)}
        />
      ))}
    </div>
  )
}

export default SubmissionsOverview

const QuestionFeatured = ({ question, bgColor }) => {
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
        <AnswerGridOverview
          // key={q.id}
          question={question}
        />

        <NarrowContainer>
          <Interaction.P style={{ textAlign: 'center' }}>
            <QuestionLink question={question}>
              <Editorial.A>Alle Antworten lesen</Editorial.A>
            </QuestionLink>
          </Interaction.P>
        </NarrowContainer>
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
          {question.values.map(({ uuid, answers, name }) => (
            <AnswersGridCard key={uuid}>
              <SubmissionLink id={uuid}>
                <a style={{ textDecoration: 'none' }}>
                  <div {...styles.answerCard}>
                    <div>
                      <Editorial.Question style={{ marginTop: 0 }}>
                        {inQuotes(answers)}
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

export const QuestionLink = ({ question, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0].split('#')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: question,
        },
      }}
      shallow
      passHref
    >
      {children}
    </Link>
  )
}

const SubmissionLink = ({ id, children }) => {
  return (
    <Link href={`/politikfragebogen/${id}`} passHref>
      {children}
    </Link>
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
