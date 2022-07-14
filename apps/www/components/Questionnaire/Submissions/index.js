import { gql, useQuery } from '@apollo/client'
import {
  Editorial,
  inQuotes,
  Interaction,
  Loader,
  CommentHeaderProfile,
  useColorContext,
} from '@project-r/styleguide'
import { ascending } from 'd3-array'
import { useRouter } from 'next/router'
import { useTranslation } from '../../../lib/withT'

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
          createdAt
          updatedAt
          displayAuthor {
            id
            name
            slug
            profilePicture
            credential {
              id
              description
              verified
            }
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
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

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
            {submissions.nodes.map(({ id, displayAuthor, answers }) => {
              return (
                <div
                  key={id}
                  style={{
                    margin: '30px 0 60px',
                    padding: 10,
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                  {...colorScheme.set('borderColor', 'divider')}
                >
                  <CommentHeaderProfile
                    t={t}
                    displayAuthor={{
                      name: displayAuthor.name,
                      profilePicture: displayAuthor.profilePicture,
                      credential: {
                        description: `${answers.totalCount} Antworten`,
                      },
                    }}
                  />
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
