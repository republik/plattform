import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view'

import { useQuery } from '@apollo/client'

import {
  ColorContextProvider,
  Container,
  Editorial,
  Interaction,
  Loader,
  NarrowContainer,
  useHeaderHeight,
} from '@project-r/styleguide'

import { QUESTIONNAIRE_ONLY_SUBMISSIONS_QUERY } from '../graphql'
import { QuestionSummaryChart } from './QuestionChart'
import { QuestionLink, SubmissionLink } from './Links'
import { Answer, AnswersGrid, AnswersGridCard } from './AnswersGrid'

export const getTargetedAnswers = (questionIds, results) => {
  return results?.nodes.map((submission) => {
    return {
      id: submission.id,
      answers: submission.answers.nodes.filter((answer) =>
        questionIds.includes(answer.question.id),
      ),
      displayAuthor: submission.displayAuthor,
    }
  })
}

export const AnswersChart = ({ question, skipTitle }) => {
  if (!question.result) return
  const totalAnswers = question.turnout.submitted
  const values = question.options.map((option) => ({
    answer: option.label,
    value:
      (question.result.find((result) => result.option.value === option.value)
        ?.count ?? 0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: 20, marginBottom: 40 }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.text}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart answers={values} key='answer' />
        </div>
      </div>
    </NarrowContainer>
  )
}

const AnswerGridOverview = ({ slug, question, valueLength, hint }) => {
  const { loading, error, data } = useQuery(
    QUESTIONNAIRE_ONLY_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 6,
        sortBy: 'random',
        answers: [
          {
            questionId: question.id,
            valueLength,
          },
        ],
      },
    },
  )

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { results },
        } = data

        const targetedAnswers = getTargetedAnswers([question.id], results) ?? []

        return (
          <>
            <NarrowContainer>
              <Editorial.Subhead style={{ textAlign: 'center' }}>
                {question.text}
              </Editorial.Subhead>
              {hint && (
                <Interaction.P style={{ textAlign: 'center', fontSize: '1em' }}>
                  {hint}
                </Interaction.P>
              )}
            </NarrowContainer>
            <ColorContextProvider colorSchemeKey='light'>
              <AnswersGrid>
                {targetedAnswers.map(({ answers, displayAuthor, id }) => (
                  <AnswersGridCard key={id}>
                    <SubmissionLink submissionId={id}>
                      <a style={{ textDecoration: 'none' }}>
                        <Answer answer={answers[0]} author={displayAuthor} />
                      </a>
                    </SubmissionLink>
                  </AnswersGridCard>
                ))}
              </AnswersGrid>
            </ColorContextProvider>
          </>
        )
      }}
    />
  )
}

export const QaBlock = ({ slug, questions, bgColor, valueLength, hint }) => {
  const router = useRouter()
  const [headerHeight] = useHeaderHeight()
  const { query } = router

  const hasTextAnswer = questions.some(
    (q) => q.__typename === 'QuestionTypeText',
  )

  const questionRef = useRef(null)
  useEffect(() => {
    if (query?.focus === questions[0].id) {
      scrollIntoView(questionRef.current, {
        time: 0,
        align: { topOffset: headerHeight, top: 0 },
      })
    }
  }, [])

  return (
    <div
      ref={questionRef}
      id={questions[0].id}
      style={{
        padding: '46px 0',
        // flexBasis: '50%',
        backgroundColor: bgColor,
        display: 'flex',
      }}
    >
      <Container>
        {questions.map((q) => {
          return q.__typename === 'QuestionTypeText' ? (
            <AnswerGridOverview
              key={q.id}
              slug={slug}
              question={q}
              valueLength={valueLength}
              hint={hint}
            />
          ) : q.__typename === 'QuestionTypeChoice' ? (
            <AnswersChart key={q.id} question={q} skipTitle={false} />
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
