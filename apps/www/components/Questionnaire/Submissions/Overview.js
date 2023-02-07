import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import { Interaction, Loader, Editorial, Button } from '@project-r/styleguide'

import AnswerText from './AnswerText'
import SingleQuestion from './SingleQuestion'
import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from './graphql'

const getSampleAnswers = (questions, results) => {
  return questions.map((question) => {
    const answers = results.nodes.map((submission) => {
      return {
        answer: submission.answers.nodes.find(
          (answer) => answer.question.id === question.id,
        ),
        displayAuthor: submission.displayAuthor,
      }
    })
    return {
      question,
      answers,
    }
  })
}

const AnswersChart = () => {
  return <span>CHART</span>
}

const AnswersCarousel = () => {
  return <span>CAROUSEL</span>
}

const AllQuestions = ({ slug }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: 10,
      sortBy: 'random',
    },
  })

  return (
    <>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { questions, results },
          } = data
          const sampleAnswers = getSampleAnswers(questions, results)

          return (
            <div style={{ marginTop: 80 }}>
              {sampleAnswers.map(({ question, answers }) => {
                const usableAnswers = answers.filter(({ answer }) => !!answer)
                const randomIdx = Math.floor(
                  Math.random() * usableAnswers.length,
                )
                const { answer, displayAuthor } = usableAnswers[randomIdx]
                // console.log({ answer, displayAuthor })
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
              })}
            </div>
          )
        }}
      />
    </>
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
