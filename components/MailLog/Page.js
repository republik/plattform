import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  Loader,
  A
} from '@project-r/styleguide'

import {
  Section,
  SectionTitle
} from '../Display/utils'

import List from './List'

const GET_MAILLOG = gql`
query getMailLog($after: String) {
  mailLog(first: 100, after: $after) {
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
      user {
        id
        name
      }
    }
  }
}
`

const Page = withT(({ userId }) => {
  return (
    <Query query={GET_MAILLOG} variables={{id: userId}}>{({loading, error, data, fetchMore}) => {
      const fetchMoreNodes = () => fetchMore({
        variables: { after: data.mailLog.pageInfo.endCursor },
        updateQuery: (previousResult, { fetchMoreResult }) => ({
          mailLog: {
            __typename: previousResult.mailLog.__typename,
            nodes: [ ...previousResult.mailLog.nodes, ...fetchMoreResult.mailLog.nodes ],
            pageInfo: fetchMoreResult.mailLog.pageInfo
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
              <List nodes={data.mailLog.nodes} />
              {data.mailLog.pageInfo.endCursor && (
                <A href='#' onClick={fetchMoreNodes}>mehr</A>
              )}
            </Section>
          }
        />
      )
    }}</Query>
  )
})

export default Page