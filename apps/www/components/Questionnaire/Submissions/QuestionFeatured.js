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
  ColorContextProvider,
  colors,
} from '@project-r/styleguide'

import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from './graphql'

export const getTargetedAnswers = (questionIds, results) => {
  return results?.nodes.map((submission) => {
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

export const QuestionLink = ({ questions, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: questions.map((q) => q.id),
        },
      }}
      passHref
    >
      {children}
    </Link>
  )
}

export const AnswersChart = ({ question, skipTitle }) => {
  const totalAnswers = question.result.reduce((agg, r) => agg + r.count, 0)
  const values = question.result.map((bucket) => ({
    answer: bucket.option.label,
    value: String(bucket.count / totalAnswers),
  }))

  const colorMap = {}
  question.result.forEach(
    (bucket, index) => (colorMap[bucket.option.label] = COLORS[index]),
  )
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
            colorMap: colorMap,
            color: 'answer',
            colorSort: 'none',
          }}
          values={values}
        />
      </div>
    </div>
  )
}

const AnswersCarousel = ({ slug, question }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: 1,
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

        const targetedAnswers = getTargetedAnswers([question.id], results) ?? []

        return (
          <>
            <Interaction.H2>{question.text}</Interaction.H2>

            <Breakout size='breakout'>
              <TeaserCarousel>
                <TeaserCarouselTileContainer>
                  <ColorContextProvider
                    localColorVariables={colors}
                    colorSchemeKey='light'
                  >
                    {targetedAnswers.map(({ answers, displayAuthor }) => (
                      <PersonLink
                        key={displayAuthor.slug}
                        displayAuthor={displayAuthor}
                      >
                        <TeaserCarouselTile borderRadius={'10px'}>
                          <TeaserCarouselHeadline.Editorial>
                            {inQuotes(answers[0].payload.value)}
                          </TeaserCarouselHeadline.Editorial>

                          <Editorial.Credit>
                            Von {displayAuthor.name}
                          </Editorial.Credit>
                        </TeaserCarouselTile>
                      </PersonLink>
                    ))}
                  </ColorContextProvider>
                </TeaserCarouselTileContainer>
              </TeaserCarousel>
            </Breakout>
          </>
        )
      }}
    />
  )
}

export const QuestionFeatured = ({ slug, questions, bgColor }) => {
  const hasTextAnswer = questions.some(
    (q) => q.__typename === 'QuestionTypeText',
  )

  return (
    <div
      style={{
        marginTop: 60,
        marginBottom: 20,
        paddingTop: 20,
        flexBasis: '50%',

        borderTop: '1px solid red',
      }}
    >
      {questions.map((q) => {
        return q.__typename === 'QuestionTypeText' ? (
          <AnswersCarousel
            key={q.id}
            slug={slug}
            question={q}
            bgColor={bgColor}
          />
        ) : q.__typename === 'QuestionTypeChoice' ? (
          <AnswersChart key={q.id} question={q} />
        ) : null
      })}

      {hasTextAnswer && (
        <Editorial.P>
          <QuestionLink questions={questions}>
            <Editorial.A>Alle Antworten lesen</Editorial.A>
          </QuestionLink>
        </Editorial.P>
      )}
    </div>
  )
}
