import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  A,
  Loader
} from '@project-r/styleguide'

import {
  Section,
  SectionTitle
} from '../Display/utils'

import List from '../MailLog/List'

const GET_USER_MAILLOG = gql`
query getUserMailLog($id: String, $first: Int, $after: String) {
  user(slug: $id) {
    id
    mailLog(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        email
        type
        template
        subject
        createdAt
        status
        error
        mandrill {
          label
          url
        }
      }
    }
  }
}
`

const MailLog = withT(({ userId, narrow = false }) => {
  return (
    <Query query={GET_USER_MAILLOG} variables={{ id: userId, first: narrow || 100 }}>{({ loading, error, data, fetchMore }) => {
      const fetchMoreNodes = () => fetchMore({
        variables: { id: data.user.id, after: data.user.mailLog.pageInfo.endCursor },
        updateQuery: (previousResult, { fetchMoreResult }) => ({
          user: {
            __typename: previousResult.user.__typename,
            id: previousResult.user.id,
            mailLog: {
              __typename: previousResult.user.mailLog.__typename,
              nodes: [ ...previousResult.user.mailLog.nodes, ...fetchMoreResult.user.mailLog.nodes ],
              pageInfo: fetchMoreResult.user.mailLog.pageInfo
            }
          }
        })
      })

      return (
        <Loader
          loading={loading}
          error={error}
          render={() =>
            <Section>
              <SectionTitle>
                E-Mails
              </SectionTitle>
              <List nodes={data.user.mailLog.nodes} narrow={narrow} />
              {!narrow && data.user.mailLog.pageInfo.endCursor && (
                <A href='#' onClick={fetchMoreNodes}>mehr</A>
              )}
            </Section>
          }
        />
      )
    }}</Query>
  )
})

export default MailLog
