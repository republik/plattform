import { gql, useQuery } from '@apollo/client'
import { Editorial, Interaction, Loader } from '@project-r/styleguide'
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
                __typename
                text
              }
              payload
            }
          }
        }
      }
    }
  }
`

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
          questionnaire: { submissions },
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
                  {answers.nodes.map(({ id, question, payload }) => {
                    return (
                      <Editorial.P key={id}>
                        <strong>{question.text}</strong>
                        <br />
                        {payload.value}
                      </Editorial.P>
                    )
                  })}
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
