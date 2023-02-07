import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Breakout,
  Loader,
  Editorial,
  Button,
  TeaserCarousel,
  TeaserCarouselTileContainer,
  TeaserCarouselTile,
  TeaserCarouselHeadline,
  TeaserSectionTitle,
  inQuotes,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL } from '../../../lib/constants'

import SingleQuestion from './SingleQuestion'
import { QUESTIONNAIRE_QUERY, QUESTIONNAIRE_SUBMISSIONS_QUERY } from './graphql'

const getSampleAnswers = (questionId, results) => {
  return [...results.nodes].map((submission) => {
    return {
      answer: submission.answers.nodes.find(
        (answer) => answer.question.id === questionId,
      ),
      displayAuthor: submission.displayAuthor,
    }
  })
}

const AnswersChart = ({ question, additionalQuestion }) => {
  return <span>CHART</span>
}

const AnswersCarousel = ({ slug, question, additionalQuestion }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
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

        const sampleAnswers = getSampleAnswers(question.id, results)

        return (
          <Breakout size='breakout'>
            <TeaserCarousel outline>
              <Link
                href={{
                  pathname,
                  query: {
                    share: question.id,
                    type: 'question',
                  },
                }}
                passHref
              >
                <TeaserSectionTitle>{question.text}</TeaserSectionTitle>
              </Link>
              <TeaserCarouselTileContainer>
                {sampleAnswers.map(({ answer, displayAuthor }) => (
                  <TeaserCarouselTile key={answer.id}>
                    <TeaserCarouselHeadline.Editorial>
                      {inQuotes(answer.payload.value)}
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
          slug={slug}
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
            {questions.map((question) => (
              <Question key={question.id} question={question} slug={slug} />
            ))}
          </div>
        )
      }}
    />
  )
}

const SubmissionsOverview = ({ slug }) => {
  const router = useRouter()
  const { query } = router
  const questionId = query.type === 'question' && query.share

  if (questionId) {
    return <SingleQuestion slug={slug} questionId={questionId} />
  }
  return <AllQuestions slug={slug} />
}

export default SubmissionsOverview
