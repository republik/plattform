import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Breakout,
  Loader,
  Editorial,
  TeaserCarousel,
  TeaserCarouselTileContainer,
  TeaserCarouselTile,
  TeaserCarouselHeadline,
  TeaserSectionTitle,
  inQuotes,
  ChartTitle,
  ChartLegend,
  Chart,
} from '@project-r/styleguide'

import TargetedQuestions from './TargetedQuestions'
import { QUESTIONNAIRE_QUERY, QUESTIONNAIRE_SUBMISSIONS_QUERY } from './graphql'

export const getTargetedAnswers = (questionIds, results) => {
  return [...results.nodes].map((submission) => {
    return {
      answers: submission.answers.nodes.filter((answer) =>
        questionIds.includes(answer.question.id),
      ),
      displayAuthor: submission.displayAuthor,
    }
  })
}

const QuestionLink = ({ question, additionalQuestion, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: [question?.id, additionalQuestion?.id]
            .filter(Boolean)
            .join(','),
          type: 'question',
        },
      }}
      passHref
    >
      {children}
    </Link>
  )
}

export const AnswersChart = ({ question, additionalQuestion, skipTitle }) => {
  const totalAnswers = question.result.reduce((agg, r) => agg + r.count, 0)
  const values = question.result.map((bucket) => ({
    answer: bucket.option.label,
    value: String(bucket.count / totalAnswers),
  }))
  return (
    <div style={{ marginTop: 20 }}>
      {!skipTitle && <ChartTitle>{question.text}</ChartTitle>}
      <Chart
        config={{
          type: 'Bar',
          numberFormat: '.0%',
          y: 'answer',
          showBarValues: true,
        }}
        values={values}
      />
      {!!additionalQuestion && (
        <ChartLegend>
          <QuestionLink
            question={question}
            additionalQuestion={additionalQuestion}
          >
            <Editorial.A>Mehr darüber</Editorial.A>
          </QuestionLink>
        </ChartLegend>
      )}
    </div>
  )
}

const AnswersCarousel = ({ slug, question, additionalQuestion }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: 5,
      sortBy: 'random',
      questionIds: [question.id],
    },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { results },
        } = data

        const targetedAnswers = getTargetedAnswers([question.id], results)

        return (
          <Breakout size='breakout'>
            <TeaserCarousel outline>
              <QuestionLink
                question={question}
                additionalQuestion={additionalQuestion}
              >
                <TeaserSectionTitle>{question.text}</TeaserSectionTitle>
              </QuestionLink>
              <TeaserCarouselTileContainer>
                {targetedAnswers.map(({ answers, displayAuthor }) => (
                  <TeaserCarouselTile key={answers[0].id}>
                    <TeaserCarouselHeadline.Editorial>
                      {inQuotes(answers[0].payload.value)}
                    </TeaserCarouselHeadline.Editorial>
                    <Editorial.Credit>
                      Von{' '}
                      <Editorial.A href='#'>{displayAuthor.name}</Editorial.A>
                    </Editorial.Credit>
                  </TeaserCarouselTile>
                ))}
              </TeaserCarouselTileContainer>
            </TeaserCarousel>
          </Breakout>
        )
      }}
    />
  )
}

const Question = ({ slug, question, additionalQuestion }) => {
  return (
    <div
      key={question.id}
      style={{
        marginBottom: 20,
        paddingTop: 20,
      }}
    >
      {question.__typename === 'QuestionTypeText' && (
        <AnswersCarousel
          slug={slug}
          question={question}
          additionalQuestion={additionalQuestion}
        />
      )}
      {question.__typename === 'QuestionTypeChoice' && (
        <AnswersChart
          question={question}
          additionalQuestion={additionalQuestion}
        />
      )}
    </div>
  )
}

const AllQuestions = ({ slug }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions },
        } = data

        return (
          <div style={{ marginTop: 80 }}>
            <Question question={questions[6]} slug={slug} />
            <Editorial.P>☝️ Simple Chart. Not linked to anything.</Editorial.P>
            <Question
              question={questions[0]}
              additionalQuestion={questions[1]}
              slug={slug}
            />
            <Editorial.P>
              ☝️ This text question is linked to a second, additional question.
            </Editorial.P>
            <Editorial.P>
              Want some more? You can also explore the following questions:
            </Editorial.P>
            <Editorial.UL>
              <Editorial.LI>
                <QuestionLink
                  question={questions[2]}
                  additionalQuestion={questions[3]}
                >
                  <Editorial.A>{questions[2].text}</Editorial.A>
                </QuestionLink>{' '}
                (psst: es gibt da noch eine Bonusfrage)
              </Editorial.LI>
              <Editorial.LI>
                <QuestionLink question={questions[5]}>
                  <Editorial.A>{questions[5].text}</Editorial.A>
                </QuestionLink>
              </Editorial.LI>
            </Editorial.UL>
            <Question question={questions[16]} slug={slug} />
            <Editorial.P>
              ☝️ This is a question with rather long answers.
            </Editorial.P>
            <Question
              question={questions[31]}
              additionalQuestion={questions[32]}
              slug={slug}
            />
            <Editorial.P>
              ☝️ This is a multiple choice question with a Zusatzfrage.
            </Editorial.P>
          </div>
        )
      }}
    />
  )
}

const SubmissionsOverview = ({ slug }) => {
  const router = useRouter()
  const { query } = router
  const questionIds = query.type === 'question' && query.share?.split(',')

  if (questionIds) {
    return <TargetedQuestions slug={slug} questionIds={questionIds} />
  }
  return <AllQuestions slug={slug} />
}

export default SubmissionsOverview
