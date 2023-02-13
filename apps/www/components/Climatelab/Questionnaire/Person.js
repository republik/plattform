import { gql } from 'graphql-tag'
import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'
import { Loader, Editorial } from '@project-r/styleguide'

import Frame from '../../Frame'
import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  SubmissionAuthor,
  SubmissionQa,
} from '../../Questionnaire/Submissions/Submission'

const QUESTIONNAIRE_SLUG = 'sommer22'

const USER_QUERY = gql`
  query getUserId($slug: String!) {
    user(slug: $slug) {
      id
      name
      statement
      portrait
    }
  }
`

const Questionnaire = ({ userId }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]

  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug: QUESTIONNAIRE_SLUG,
      userIds: [userId],
      sortBy: 'random',
    },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions, results },
        } = data
        const submission = results.nodes[0]
        return (
          <div>
            <SubmissionAuthor
              displayAuthor={submission.displayAuthor}
              submissionUrl={pathname}
              createdAt={submission.createdAt}
              updatedAt={submission.updatedAt}
            />
            {submission.answers.nodes.map(
              ({ id, question: { id: qid }, payload }) => {
                const question = questions.find((q) => q.id === qid)
                return (
                  <SubmissionQa
                    key={id}
                    question={question}
                    payload={payload}
                  />
                )
              },
            )}
          </div>
        )
      }}
    />
  )
}

const Page = () => {
  const router = useRouter()
  const {
    query: { slug },
  } = router

  const { loading, error, data } = useQuery(USER_QUERY, {
    variables: {
      slug,
    },
  })
  return (
    <Frame>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { user } = data
          return (
            <div>
              <Editorial.Headline>Klimafragebogen</Editorial.Headline>
              <Questionnaire userId={user.id} />
            </div>
          )
        }}
      />
    </Frame>
  )
}

export default Page
