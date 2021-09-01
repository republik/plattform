import React, { useState, useEffect, useCallback } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import InfiniteScroller from 'react-infinite-scroller'
import debounce from 'lodash.debounce'

import withT from '../../lib/withT'

import { Loader, A, Field } from '@project-r/styleguide'

import { SectionNav } from '../Display/utils'

import List from './List'

const GET_MAILBOX = gql`
  query getMailbox($after: String, $search: String, $hasError: Boolean) {
    mailbox(
      first: 100
      after: $after
      filters: { hasError: $hasError, email: $search }
    ) {
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
  const [search, setSearch] = useState()

  useEffect(() => {
    setSearch(params?.search)
  }, [params])

  const debounceOnChange = useCallback(
    debounce(current => onChange({ ...params, ...current }), 400),
    []
  )

  const onChangeSearch = (_, value, shouldValidate) => {
    debounceOnChange({ search: value })
    setSearch(value)
  }

  const toggleFilterErrornous = e => {
    e?.preventDefault()
    onChange({ ...params, hasError: !params?.hasError ? true : null })
  }

  return (
    <Query
      query={GET_MAILBOX}
      variables={{ hasError: !!params?.hasError, search: params?.search }}
    >
      {({ loading, error, data, fetchMore }) => {
        const fetchMoreNodes = () =>
          fetchMore({
            variables: {
              after: data.mailbox.pageInfo.endCursor,
              hasError: !!params?.hasError
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
          <>
            <Field
              name='search'
              type='search'
              label={'Suche (nur E-Mail-Adresse)'}
              onChange={onChangeSearch}
              value={search}
            />
            <SectionNav>
              <A href='#' onClick={toggleFilterErrornous}>
                {params?.hasError
                  ? 'Alle E-Mails'
                  : 'Nur problematische Zustellungen'}
              </A>
            </SectionNav>
            <Loader
              loading={loading}
              error={error}
              render={() => (
                <>
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
          </>
        )
      }}
    </Query>
  )
})

export default Page
