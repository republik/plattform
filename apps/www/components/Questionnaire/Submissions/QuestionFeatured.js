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
  Breakout,
} from '@project-r/styleguide'

import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from './graphql'

export const QUESTION_SEPARATOR = ','

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

export const PersonLink = ({ displayAuthor, children }) => {
  return (
    <Link href={`/klimafragebogen/${displayAuthor.slug}`} passHref>
      {children}
    </Link>
  )
}

export const QuestionLink = ({ question, additionalQuestion, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: [question?.id, additionalQuestion?.id]
            .filter(Boolean)
            .join(QUESTION_SEPARATOR),
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

            <Breakout size='breakout'>
              <TeaserCarousel outline>
                <TeaserCarouselTileContainer>
                  {targetedAnswers.map(({ answers, displayAuthor }) => (
                    <PersonLink
                      key={displayAuthor.slug}
                      displayAuthor={displayAuthor}
                    >
                      <TeaserCarouselTile
                        bgColor={'#fff'}
                        color={'#000'}
                        borderRadius={'10px'}
                      >
                        <TeaserCarouselHeadline.Editorial>
                          {inQuotes(answers[0].payload.value)}
                        </TeaserCarouselHeadline.Editorial>

                        <Editorial.Credit>
                          <span style={{ color: '#000' }}>
                            Von {displayAuthor.name}
                          </span>
                        </Editorial.Credit>
                      </TeaserCarouselTile>
                    </PersonLink>
                  ))}
                </TeaserCarouselTileContainer>
              </TeaserCarousel>
            </Breakout>
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

export const QuestionFeatured = ({
  slug,
  question,
  additionalQuestion,
  bgColor,
}) => {
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
