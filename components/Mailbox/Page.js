import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import InfiniteScroller from 'react-infinite-scroller'

import withT from '../../lib/withT'

import { Loader, A } from '@project-r/styleguide'

import { SectionTitle, SectionNav } from '../Display/utils'

import List from './List'

const GET_MAILBOX = gql`
  query getMailbox($after: String, $hasError: Boolean) {
    mailbox(first: 100, after: $after, filters: { hasError: $hasError }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        type
        template
        date
        status
        error
        from {
          id
          address
          name
          user {
            id
            name
          }
        }
        to {
          id
          address
          name
          user {
            id
            name
          }
        }
        cc {
          id
          address
          name
          user {
            id
            name
          }
        }
        bcc {
          id
          address
          name
          user {
            id
            name
          }
        }
        subject
        html
        links {
          id
          label
          url
        }
      }
    }
  }
`

const Page = withT(({ params, onChange }) => {
  const { hasError = false } = params

  const toggleFilterErrornous = e => {
    e?.preventDefault()
    onChange({ ...params, hasError: !hasError ? true : null })
  }

  return (
    <Query query={GET_MAILBOX} variables={{ hasError: !!hasError }}>
      {({ loading, error, data, fetchMore }) => {
        const fetchMoreNodes = () =>
          fetchMore({
            variables: {
              after: data.mailbox.pageInfo.endCursor,
              hasError: !!hasError
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              const previousNodes = previousResult.mailbox.nodes

              const fetchedPage = fetchMoreResult?.mailbox
              const __typename = fetchedPage?.__typename
              const fetchedNodes = fetchedPage?.nodes || []
              const newPageInfo = fetchedPage?.pageInfo

              return {
                mailbox: {
                  __typename,
                  nodes: [...previousNodes, ...fetchedNodes],
                  pageInfo: newPageInfo
                }
              }
            }
          })

        return (
          <Loader
            loading={loading}
            error={error}
            render={() => (
              <>
                <SectionTitle>
                  E-Mails {hasError && '(problematische Zustellungen)'}
                </SectionTitle>
                <SectionNav>
                  <A href='#' onClick={toggleFilterErrornous}>
                    {hasError
                      ? 'Alle E-Mails'
                      : 'Nur problematische Zustellungen'}
                  </A>
                </SectionNav>
                <InfiniteScroller
                  loadMore={fetchMoreNodes}
                  loader={<Loader loading />}
                  hasMore={data.mailbox.pageInfo.hasNextPage}
                  useWindow={false}
                >
                  <List nodes={data.mailbox.nodes} />
                </InfiniteScroller>
              </>
            )}
          />
        )
      }}
    </Query>
  )
})

export default Page
