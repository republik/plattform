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
  inQuotes,
  ChartLegend,
  Chart,
  Interaction,
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

export const COLORS = ['#6954ff', '#9F92FF', '#D9D4FF']

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
            <Interaction.P>
              <QuestionLink
                question={question}
                additionalQuestion={additionalQuestion}
              >
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Interaction.P>
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

            <Breakout size='breakout'>
              <TeaserCarousel outline>
                <TeaserCarouselTileContainer>
                  {targetedAnswers.map(({ answers, displayAuthor }) => (
                    <TeaserCarouselTile key={answers[0].id} bgColor={bgColor}>
                      <TeaserCarouselHeadline.Interaction>
                        {inQuotes(answers[0].payload.value)}
                      </TeaserCarouselHeadline.Interaction>

                      <Editorial.Credit>
                        Von{' '}
                        <Editorial.A
                          href={`/klimafragebogen/${displayAuthor.slug}`}
                        >
                          {displayAuthor.name}
                        </Editorial.A>
                      </Editorial.Credit>
                    </TeaserCarouselTile>
                  ))}
                </TeaserCarouselTileContainer>
              </TeaserCarousel>
            </Breakout>
            <Interaction.P>
              <QuestionLink
                question={question}
                additionalQuestion={additionalQuestion}
              >
                <Editorial.A>Alle Antworten lesen</Editorial.A>
              </QuestionLink>
            </Interaction.P>
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
          <div style={{ marginTop: 80 }}>
            <Question question={questions[6]} slug={slug} />
            <Interaction.P>
              Simple Chart. Not linked to anything. Lorem ipsum dolor sit amet,
              consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
              elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
              magna aliquyam erat, sed diam voluptua.
            </Interaction.P>
            <Question
              question={questions[0]}
              additionalQuestion={questions[1]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <Interaction.P>
              This text question is linked to a second, additional question.
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua.
            </Interaction.P>
            <Interaction.P>
              Want some more? You can also explore the following questions:
            </Interaction.P>
            <Interaction.P>
              <ul>
                <li>
                  <QuestionLink
                    question={questions[2]}
                    additionalQuestion={questions[3]}
                  >
                    <Editorial.A>{questions[2].text}</Editorial.A>
                  </QuestionLink>{' '}
                  (psst: es gibt da noch eine Bonusfrage)
                </li>
                <li>
                  <QuestionLink question={questions[5]}>
                    <Editorial.A>{questions[5].text}</Editorial.A>
                  </QuestionLink>
                </li>
              </ul>
            </Interaction.P>
            <Question
              question={questions[16]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <Interaction.P>
              This is a question with rather long answers. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
              invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
              dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
              elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
              magna aliquyam erat, sed diam voluptua.
            </Interaction.P>
            <Question
              question={questions[31]}
              additionalQuestion={questions[32]}
              slug={slug}
            />
            <Interaction.P>
              This is a multiple choice question with a Zusatzfrage. Lorem ipsum
              dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
              eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
              sed diam voluptua. At vero eos et accusam et justo duo dolores et
              ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
              Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
              et dolore magna aliquyam erat, sed diam voluptua.
            </Interaction.P>
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
