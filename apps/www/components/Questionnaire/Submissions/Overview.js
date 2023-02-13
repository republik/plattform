import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Loader,
  TeaserCarousel,
  TeaserCarouselTileContainer,
  TeaserCarouselTile,
  TeaserCarouselHeadline,
  inQuotes,
  Chart,
  Interaction,
  Editorial,
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

export const COLORS = ['#00dd97', '#97f8fe', '#fefd67']

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
      {!skipTitle && <Interaction.H2>{question.text}</Interaction.H2>}
      <div style={{ marginTop: 20 }}>
        <Chart
          config={{
            type: 'Bar',
            numberFormat: '.0%',
            y: 'answer',
            showBarValues: true,
            colorRange: COLORS,
            color: 'answer',
            colorSort: 'none',
          }}
          values={values}
        />
        {!!additionalQuestion && (
          <div style={{ marginTop: '20px' }}>
            <Editorial.P>
              <QuestionLink
                question={question}
                additionalQuestion={additionalQuestion}
              >
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Editorial.P>
          </div>
        )}
      </div>
    </div>
  )
}

const AnswersCarousel = ({ slug, question, additionalQuestion, bgColor }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: 8,
      sortBy: 'random',
      questionIds: [question.id],
    },
  })

  // TODO filter answers by length, make Carousel with short answers and carousels with long answers

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
          <>
            <Interaction.H2>{question.text}</Interaction.H2>

            <div style={{ margin: '0 -200px' }}>
              <TeaserCarousel outline>
                <TeaserCarouselTileContainer>
                  {targetedAnswers.map(({ answers, displayAuthor }) => (
                    <TeaserCarouselTile
                      key={answers[0].id}
                      bgColor={'#fff'}
                      color={'#000'}
                      borderRadius={'10px'}
                    >
                      <TeaserCarouselHeadline.Editorial>
                        {inQuotes(answers[0].payload.value)}
                      </TeaserCarouselHeadline.Editorial>

                      <Editorial.Credit>
                        <span style={{ color: '#000' }}>Von </span>
                        <Editorial.A
                          href={`/klimafragebogen/${displayAuthor.slug}`}
                        >
                          <span style={{ color: '#000' }}>
                            {displayAuthor.name}
                          </span>
                        </Editorial.A>
                      </Editorial.Credit>
                    </TeaserCarouselTile>
                  ))}
                </TeaserCarouselTileContainer>
              </TeaserCarousel>
            </div>
            <Editorial.P>
              <QuestionLink
                question={question}
                additionalQuestion={additionalQuestion}
              >
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Editorial.P>
          </>
        )
      }}
    />
  )
}

const Question = ({ slug, question, additionalQuestion, bgColor }) => {
  return (
    <div
      key={question.id}
      style={{
        marginTop: 60,
        marginBottom: 20,
        paddingTop: 20,
      }}
    >
      {question.__typename === 'QuestionTypeText' && (
        <AnswersCarousel
          slug={slug}
          question={question}
          additionalQuestion={additionalQuestion}
          bgColor={bgColor}
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
          <div style={{ margin: '0 auto' }}>
            <Question question={questions[6]} slug={slug} />
            <Question
              question={questions[0]}
              additionalQuestion={questions[1]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <div style={{ marginTop: 60 }}>
              <Editorial.P>
                <ul style={{ listStyleType: 'square', paddingLeft: 25 }}>
                  <li style={{ fontSize: 21, marginBottom: 20 }}>
                    <QuestionLink
                      question={questions[2]}
                      additionalQuestion={questions[3]}
                    >
                      <Editorial.A>{questions[2].text}</Editorial.A>
                    </QuestionLink>{' '}
                    (psst: es gibt da noch eine Bonusfrage)
                  </li>
                  <li style={{ fontSize: 21, marginBottom: 20 }}>
                    <QuestionLink question={questions[5]}>
                      <Editorial.A>{questions[5].text}</Editorial.A>
                    </QuestionLink>
                  </li>
                </ul>
              </Editorial.P>
            </div>
            <Question
              question={questions[16]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <Question
              question={questions[31]}
              additionalQuestion={questions[32]}
              slug={slug}
            />
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
