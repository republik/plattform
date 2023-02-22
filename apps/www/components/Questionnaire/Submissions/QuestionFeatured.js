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
  Container,
  ChevronRightIcon,
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
      {!skipTitle && <Editorial.Subhead>{question.text}</Editorial.Subhead>}
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

        const targetedAnswers = getTargetedAnswers([question.id], results) ?? []

        return (
          <>
            <Editorial.Subhead>{question.text}</Editorial.Subhead>
            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <div
                style={{
                  display: 'grid',
                  gap: '24px',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gridTemplateRows: 'auto',
                  gridAutoFlow: 'row dense',
                  margin: '48px 0',
                }}
              >
                {targetedAnswers.map(({ answers, displayAuthor }) => (
                  <PersonLink
                    key={displayAuthor.slug}
                    displayAuthor={displayAuthor}
                  >
                    <a style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          background: 'white',
                          borderRadius: 10,
                          padding: 24,
                          color: 'black',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',

                          textAlign: 'center',
                        }}
                      >
                        <div>
                          <Editorial.Question style={{ marginTop: 0 }}>
                            {inQuotes(answers[0].payload.value)}
                          </Editorial.Question>
                          <Editorial.Credit>
                            Von {displayAuthor.name}
                          </Editorial.Credit>
                        </div>
                      </div>
                    </a>
                  </PersonLink>
                ))}
              </div>
            </ColorContextProvider>

            {/* <Breakout size='breakout'> */}
            {/* <TeaserCarousel>
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
            </TeaserCarousel> */}
            {/* </Breakout> */}
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
        padding: '0 0 46px 0',
        // flexBasis: '50%',
        backgroundColor: bgColor,
        display: 'flex',
      }}
    >
      <Container>
        {questions.map((q) => {
          return q.__typename === 'QuestionTypeText' ? (
            <AnswersCarousel key={q.id} slug={slug} question={q} />
          ) : q.__typename === 'QuestionTypeChoice' ? (
            <AnswersChart key={q.id} question={q} />
          ) : null
        })}

        {hasTextAnswer && (
          <Interaction.P style={{ fontSize: '0.9em' }}>
            <QuestionLink questions={questions}>
              <a style={{ textDecoration: 'none', color: 'currentColor' }}>
                Alle Antworten lesen <ChevronRightIcon />
              </a>
            </QuestionLink>
          </Interaction.P>
        )}
      </Container>
    </div>
  )
}
