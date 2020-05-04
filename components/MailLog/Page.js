import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  Loader,
  A,
  P,
  Interaction
} from '@project-r/styleguide'

import {
  Section,
  SectionTitle,
  SectionNav
} from '../Display/utils'

import List from './List'

const GET_MAILLOG = gql`
query getMailLog($after: String, $errornous: Boolean) {
  mailLog(first: 100, after: $after, filters: { errornous: $errornous }) {
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

const Page = withT(({ params, onChange }) => {
  const { errornous = false } = params

  const toggleFilterErrornous = e => {
    e.preventDefault()
    onChange({ ...params, errornous: !errornous ? true : null })
  }

  return (
    <Query query={GET_MAILLOG} variables={{ errornous: !!errornous }}>{({ loading, error, data, fetchMore }) => {
      const fetchMoreNodes = () => fetchMore({
        variables: { after: data.mailLog.pageInfo.endCursor, errornous },
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
                E-Mails {errornous && '(problematische Zustellungen)'}
              </SectionTitle>
              <SectionNav>
                <A href='#' onClick={toggleFilterErrornous}>{errornous ? 'Alle E-Mails' : 'Nur problematische Zustellungen'}</A>
              </SectionNav>
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