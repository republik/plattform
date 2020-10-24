import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import {
  Loader,
  A
} from '@project-r/styleguide'

import {
  Section,
  SectionTitle,
  SectionNav
} from '../Display/utils'

import List from './List'

const GET_MAILLOG = gql`
query getMailLog($after: String, $hasError: Boolean) {
  mailLog(first: 100, after: $after, filters: { hasError: $hasError }) {
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
        createdAt
      }
    }
  }
}
`

const Page = withT(({ params, onChange }) => {
  const { hasError = false } = params

  const toggleFilterErrornous = e => {
    e.preventDefault()
    onChange({ ...params, hasError: !hasError ? true : null })
  }

  return (
    <Query query={GET_MAILLOG} variables={{ hasError: !!hasError }}>{({ loading, error, data, fetchMore }) => {
      const fetchMoreNodes = () => fetchMore({
        variables: { after: data.mailLog.pageInfo.endCursor, hasError: !!hasError },
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
            <>
              <SectionTitle>
                E-Mails {hasError && '(problematische Zustellungen)'}
              </SectionTitle>
              <SectionNav>
                <A href='#' onClick={toggleFilterErrornous}>{hasError ? 'Alle E-Mails' : 'Nur problematische Zustellungen'}</A>
              </SectionNav>
              <List nodes={data.mailLog.nodes} />
              {data.mailLog.pageInfo.endCursor && (
                <A href='#' onClick={fetchMoreNodes}>mehr</A>
              )}
            </>
          }
        />
      )
    }}</Query>
  )
})

export default Page