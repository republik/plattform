import { gql, useQuery } from '@apollo/client'
import { Editorial, inQuotes, Interaction, Loader } from '@project-r/styleguide'
import { ascending } from 'd3-array'
import { useRouter } from 'next/router'

export const mainQuery = gql`
  query getQuestionnaireSubmissions($slug: String!) {
    questionnaire(slug: $slug) {
      id
      description
      beginDate
      endDate
      userHasSubmitted
      userSubmitDate
      questions {
        id
        text
        ... on QuestionTypeChoice {
          options {
            label
            value
            category
          }
        }
        ... on QuestionTypeRange {
          kind
          ticks {
            label
            value
          }
        }
      }
      submissions {
        totalCount
        nodes {
          id
          displayAuthor {
            name
          }
          user {
            id
            name
          }
          answers {
            totalCount
            nodes {
              id
              question {
                id
              }
              payload
            }
          }
        }
      }
    }
  }
`

const AnswerText = ({ value, question }) => {
  if (question.options) {
    const selectedOptions = question.options.filter((option) =>
      value.includes(option.value),
    )
    return selectedOptions.map((option) => option.label).join(', ')
  }
  if (question.ticks) {
    const closest = question.ticks
      .map((tick) => ({
        distance: Math.abs(tick.value - value),
        tick,
      }))
      .sort((a, b) => ascending(a.distance, b.distance))[0]
    return (
      <>
        {closest.distance !== 0 && 'Am ehesten '}
        {inQuotes(closest.tick.label || closest.tick.value)}
      </>
    )
  }

  return value
}

const Answers = () => {
  const {
    query: { slug },
  } = useRouter()
  const { loading, error, data } = useQuery(mainQuery, {
    variables: {
      slug,
    },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire,
          questionnaire: { submissions, questions },
        } = data
        return (
          <>
            <Interaction.H2>{questionnaire.description}</Interaction.H2>
            <Interaction.P>{submissions.totalCount} Teilnehmende</Interaction.P>
            {submissions.nodes.map(({ id, user, displayAuthor, answers }) => {
              return (
                <div key={id} style={{ margin: '30px 0 60px' }}>
                  <Interaction.H3>
                    {answers.totalCount} Antworten von{' '}
                    {user.name || displayAuthor.name}
                  </Interaction.H3>
                  {answers.nodes.map(
                    ({ id, question: { id: qid }, payload }) => {
                      const question = questions.find((q) => q.id === qid)

                      return (
                        <Editorial.P key={id}>
                          <strong>{question.text}</strong>
                          <br />
                          <AnswerText
                            value={payload.value}
                            question={question}
                          />
                        </Editorial.P>
                      )
                    },
                  )}
                </div>
              )
            })}
          </>
        )
      }}
    />
  )
}

export default Answers
