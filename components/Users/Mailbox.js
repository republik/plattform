import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import withT from '../../lib/withT'

import { A, Loader } from '@project-r/styleguide'

import { Section, SectionTitle, SectionNav } from '../Display/utils'

import List from '../Mailbox/List'

const GET_USER_MAILBOX = gql`
  query getUserMailbox($id: String, $first: Int, $after: String) {
    user(slug: $id) {
      id
      email
      mailbox(first: $first, after: $after) {
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
  }
`

const Mailbox = withT(({ userId, narrow = false }) => {
  return (
    <Query
      query={GET_USER_MAILBOX}
      variables={{ id: userId, first: narrow || 100 }}
    >
      {({ loading, error, data, fetchMore }) => {
        const fetchMoreNodes = () =>
          fetchMore({
            variables: {
              id: data.user.id,
              after: data.user.mailbox.pageInfo.endCursor
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              const previousNodes = previousResult.user.mailbox.nodes

              const fetchedPage = fetchMoreResult?.user?.mailbox
              const __typename = fetchedPage?.__typename
              const fetchedNodes = fetchedPage?.nodes || []
              const newPageInfo = fetchedPage?.pageInfo

              return {
                ...previousResult,
                user: {
                  ...previousResult.user,
                  mailbox: {
                    __typename,
                    nodes: [...previousNodes, ...fetchedNodes],
                    pageInfo: newPageInfo
                  }
                }
              }
            }
          })

        return (
          <Loader
            loading={loading}
            error={error}
            render={() => (
              <Section>
                <SectionTitle>E-Mails</SectionTitle>
                {!narrow && (
                  <SectionNav>
                    <A
                      href={`https://mandrillapp.com/settings/rejections?q=${encodeURIComponent(
                        data.user.email
                      )}`}
                      target='_blank'
                    >
                      Check Denylist
                    </A>
                  </SectionNav>
                )}
                <List nodes={data.user.mailbox.nodes} narrow={narrow} />
                {!narrow && data.user.mailbox.pageInfo.hasNextPage && (
                  <A href='#' onClick={fetchMoreNodes}>
                    mehr
                  </A>
                )}
              </Section>
            )}
          />
        )
      }}
    </Query>
  )
})

export default Mailbox
