import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view'

import { useQuery } from '@apollo/client'

import {
  ColorContextProvider,
  colors,
  Container,
  Editorial,
  inQuotes,
  Interaction,
  Loader,
  NarrowContainer,
} from '@project-r/styleguide'

import { useMe } from '../../../lib/context/MeContext'

import {
  QUESTIONNAIRE_SUBMISSION_BOOL_QUERY,
  QUESTIONNAIRE_ONLY_SUBMISSIONS_QUERY,
} from './graphql'
import { AnswersGrid, AnswersGridCard } from './AnswersGrid'
import { QuestionSummaryChart } from './QuestionChart'

// re-introduced since actionbar/article only expect a single share param
// (otherwise share for multiple questions fails)
export const QUESTION_SEPARATOR = ','

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

export const SubmissionLink = ({ id, children, personPagePath }) => {
  return (
    <Link href={`/${personPagePath}/${id}`} passHref>
      {children}
    </Link>
  )
}

export const QuestionLink = ({ questions, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0].split('#')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: questions.map((q) => q.id).join(QUESTION_SEPARATOR),
        },
      }}
      shallow
      passHref
    >
      {children}
    </Link>
  )
}

export const LinkToEditQuestionnaire = ({
  slug,
  children,
  newOnly,
  questionnairePath,
  personPagePath,
}) => {
  const { me } = useMe()
  const { loading, data } = useQuery(QUESTIONNAIRE_SUBMISSION_BOOL_QUERY, {
    skip: !me,
    variables: { slug, userIds: [me?.id] },
  })

  const hasFilledQuestionnaire = data?.questionnaire?.results?.totalCount > 0
  if (hasFilledQuestionnaire && newOnly) return null
  return (
    <Editorial.P>
      {loading || !hasFilledQuestionnaire ? (
        <span>
          Wie lauten Ihre Antworten? Füllen Sie unseren Fragebogen{' '}
          <Link href={questionnairePath}>
            <Editorial.A>hier</Editorial.A>
          </Link>{' '}
          aus.
        </span>
      ) : (
        <span>
          Sie möchten Ihre eigenen Antworten teilen oder nochmals bearbeiten?{' '}
          <Link
            href={`/${personPagePath}/${data.questionnaire.results.nodes[0].id}`}
          >
            <Editorial.A> Hierlang.</Editorial.A>
          </Link>
        </span>
      )}
      {children}
    </Editorial.P>
  )
}

export const AnswersChart = ({ question, skipTitle }) => {
  if (!question.result) return
  const totalAnswers = question.result.reduce((agg, r) => agg + r.count, 0)
  const values = question.options.map((option) => ({
    answer: option.label,
    value:
      (question.result.find((result) => result.option.value === option.value)
        ?.count ?? 0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: 20 }}>
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

const AnswerGridOverview = ({
  slug,
  question,
  valueLength,
  hint,
  personPagePath,
}) => {
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
            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <AnswersGrid>
                {targetedAnswers.map(({ answers, displayAuthor, id }) => (
                  <AnswersGridCard key={id}>
                    <SubmissionLink id={id} personPagePath={personPagePath}>
                      <a style={{ textDecoration: 'none' }}>
                        <div {...styles.answerCard}>
                          <div>
                            <Editorial.Question style={{ marginTop: 0 }}>
                              {inQuotes(answers[0]?.payload?.value ?? '')}
                            </Editorial.Question>
                            <Editorial.Credit
                              style={{
                                marginTop: '0',
                                paddingTop: '20px',
                              }}
                            >
                              Von{' '}
                              <span style={{ textDecoration: 'underline' }}>
                                {displayAuthor.name}
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
      }}
    />
  )
}

export const QuestionFeatured = ({
  slug,
  questions,
  bgColor,
  valueLength,
  hint,
  personPagePath,
}) => {
  const router = useRouter()
  const { query } = router

  const hasTextAnswer = questions.some(
    (q) => q.__typename === 'QuestionTypeText',
  )

  const questionRef = useRef()
  useEffect(() => {
    if (query?.focus === questions[0].id) {
      scrollIntoView(questionRef.current)
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
              personPagePath={personPagePath}
            />
          ) : q.__typename === 'QuestionTypeChoice' ? (
            <AnswersChart key={q.id} question={q} />
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
