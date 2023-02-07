import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import { Interaction, Loader, Editorial, Button } from '@project-r/styleguide'

import AnswerText from './AnswerText'
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

const AnswersChart = ({ question }) => {
  return <span>CHART</span>
}

const AnswersCarousel = ({ slug, question, count = 5 }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: count,
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
          <>
            {sampleAnswers.map(({ answer, displayAuthor }) => (
              <Editorial.P key={question.id}>
                <AnswerText
                  text={answer.payload.text}
                  value={answer.payload.value}
                  question={question}
                  isQuote
                />
                <br />
                <em>– {displayAuthor.name}</em>
              </Editorial.P>
            ))}
          </>
        )
      }}
    />
  )
}

const Question = ({ slug, question, additionalQuestion, count = 5 }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]

  return (
    <div
      key={question.id}
      style={{
        marginBottom: 20,
        paddingTop: 20,
        borderTop: '1px solid black',
      }}
    >
      <Interaction.H3>{question.text}</Interaction.H3>
      <AnswersCarousel slug={slug} question={question} />
      <Button
        small
        onClick={() => {
          router.replace({
            pathname,
            query: {
              share: question.id,
              type: 'question',
            },
          })
        }}
      >
        alle Antworte lesen
      </Button>
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
