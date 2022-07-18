import { gql, useQuery } from '@apollo/client'
import {
  Editorial,
  Interaction,
  Loader,
  CommentHeaderProfile,
  SearchIcon,
  Field,
  useDebounce,
  HR,
} from '@project-r/styleguide'
import { useRouter } from 'next/router'
import { useTranslation } from '../../../lib/withT'
import AnswerText from './AnswerText'

const mainQuery = gql`
  query getQuestionnaireSubmissions($slug: String!, $search: String) {
    questionnaire(slug: $slug) {
      id
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
      }
      results: submissions(search: $search) {
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

const getTotalCount = (data) => data?.questionnaire?.submissions?.totalCount

const Submissions = ({ slug }) => {
  const router = useRouter()
  const searchQuery = router.query.q || ''
  const [search] = useDebounce(searchQuery, 100)
  const { loading, error, data, previousData } = useQuery(mainQuery, {
    variables: {
      slug,
      search,
    },
  })
  const { t } = useTranslation()

  return (
    <>
      <Interaction.H2>
        {t.pluralize('questionnaire/submissions/count', {
          count: getTotalCount(data) || getTotalCount(previousData) || '',
        })}
      </Interaction.H2>
      <Field
        label='Suche'
        value={searchQuery}
        onChange={(_, value) => {
          router[searchQuery ? 'replace' : 'push'](
            `${router.asPath.split('?')[0]}${
              value ? `?q=${encodeURIComponent(value)}` : ''
            }`,
            undefined,
            { shallow: true },
          )
        }}
        icon={<SearchIcon size={30} />}
      />
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results, questions },
          } = data
          return (
            <>
              {results.totalCount !== getTotalCount(data) && (
                <Interaction.P>
                  {t.pluralize('search/preloaded/results', {
                    count: results.totalCount,
                  })}
                </Interaction.P>
              )}
              {results.nodes.map(({ id, displayAuthor, answers }) => {
                return (
                  <div
                    key={id}
                    style={{
                      marginTop: 40,
                    }}
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
                              text={payload.text}
                              value={payload.value}
                              question={question}
                            />
                          </Editorial.P>
                        )
                      },
                    )}
                    <HR />
                  </div>
                )
              })}
            </>
          )
        }}
      />
    </>
  )
}

export default Submissions
