import { useState, useEffect, useCallback } from 'react'
import { Query } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import InfiniteScroller from 'react-infinite-scroller'
import debounce from 'lodash.debounce'

import { Loader, A, Field } from '@project-r/styleguide'

import withT from '../../lib/withT'

import { SectionNav } from '../Display/utils'

import { fragments } from './utils'
import List from './List'
import { Body as MailBody } from './Mail'

const GET_MAILBOX = gql`
  query getMailbox(
    $after: String
    $search: String
    $hasError: Boolean
    $id: ID
  ) {
    mailbox(
      first: 30
      after: $after
      filters: { hasError: $hasError, email: $search, id: $id }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...MailboxRecordFragment
      }
    }
  }

  ${fragments.record}
`

const Page = withT(({ params, onChange }) => {
  const [search, setSearch] = useState()

  useEffect(() => {
    setSearch(params?.search)
  }, [params])

  const debounceOnChange = useCallback(
    debounce((current) => onChange({ ...params, ...current }), 400),
    [],
  )

  const onChangeSearch = (_, value) => {
    debounceOnChange({ search: value })
    setSearch(value)
  }

  const toggleFilterErrornous = (e) => {
    e?.preventDefault()
    onChange({ ...params, hasError: !params?.hasError ? true : null })
  }

  return (
    <Query
      query={GET_MAILBOX}
      variables={{
        hasError: !!params?.hasError,
        search: params?.search,
        id: params?.mailId,
      }}
    >
      {({ loading, error, data, fetchMore }) => {
        const fetchMoreNodes = () =>
          fetchMore({
            variables: {
              after: data.mailbox.pageInfo.endCursor,
              hasError: !!params?.hasError,
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
                  pageInfo: newPageInfo,
                },
              }
            },
          })

        return (
          <>
            {!params?.mailId && (
              <Field
                name='search'
                type='search'
                label={'Suche (nur E-Mail-Adresse)'}
                onChange={onChangeSearch}
                value={search}
              />
            )}
            {!params?.mailId && (
              <SectionNav>
                <A href='#' onClick={toggleFilterErrornous}>
                  {params?.hasError
                    ? 'Alle E-Mails'
                    : 'Nur problematische Zustellungen'}
                </A>
              </SectionNav>
            )}
            <Loader
              loading={loading}
              error={error}
              render={() => (
                <InfiniteScroller
                  loadMore={fetchMoreNodes}
                  loader={<Loader loading />}
                  hasMore={data.mailbox.pageInfo.hasNextPage}
                  useWindow={false}
                >
                  {!params?.mailId && <List nodes={data.mailbox.nodes} />}
                  {params?.mailId && <MailBody mail={data.mailbox.nodes[0]} />}
                </InfiniteScroller>
              )}
            />
          </>
        )
      }}
    </Query>
  )
})

export default Page
