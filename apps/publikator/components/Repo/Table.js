import { useState, useEffect } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { descending, ascending } from 'd3-array'
import { withRouter } from 'next/router'

import { A, Label, colors } from '@project-r/styleguide'

import withT from '../../lib/withT'

import { Table, Tr, Th, ThOrder, Td } from '../Table'
import Loader from '../Loader'

import PhaseFilter from './Phases'
import DebouncedSearch, { SEARCH_MIN_LENGTH } from './Search'
import RepoRow from './Row'

export const filterAndOrderRepos = gql`
  query repoListSearch(
    $after: String
    $search: String
    $phases: [RepoPhaseKey!]
    $orderBy: RepoOrderBy
    $isTemplate: Boolean
  ) {
    repos: reposSearch(
      first: 50
      after: $after
      search: $search
      phases: $phases
      orderBy: $orderBy
      isTemplate: $isTemplate
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        meta {
          publishDate
        }
        latestCommit {
          id
          date
          message
          author {
            name
          }
          document {
            id
            meta {
              template
              title
              contributors {
                name
                kind
                user {
                  id
                  username
                }
              }
              series {
                title
                overview {
                  id
                  repoId
                }
                episodes {
                  label
                  document {
                    id
                    repoId
                  }
                }
              }
              section {
                id
                meta {
                  title
                }
              }
              format {
                id
                meta {
                  title
                }
              }
              dossier {
                id
                meta {
                  title
                }
              }
            }
          }
        }
        latestPublications {
          name
          prepublication
          live
          scheduledAt
          document {
            id
            meta {
              path
            }
          }
        }
        currentPhase {
          key
          color
          label
        }
      }
    }
    phasesAgg: reposSearch(search: $search, isTemplate: false) {
      phases {
        key
        color
        label
        count
      }
    }
  }
`

const styles = {
  filterBar: css({
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.divider}`,
  }),
  pageInfo: css({
    marginTop: 10,
    textAlign: 'right',
  }),
}

const orderFields = [
  {
    field: 'pushed',
    width: '28%',
    accessor: (repo) => new Date(repo.latestCommit.date),
  },
  {
    field: 'published',
    width: '10%',
    accessor: (repo) => new Date(repo.meta.publishDate),
  },
]

const PageInfo = withT(({ t, repos, loading, fetchMore }) => {
  return repos ? (
    <div {...styles.pageInfo}>
      <Label>
        {repos.nodes.length === repos.totalCount
          ? t('repo/table/pageInfo/total', {
              count: repos.totalCount,
            })
          : t('repo/table/pageInfo/loadedTotal', {
              loaded: repos.nodes.length,
              total: repos.totalCount,
            })}
        <br />
        {!loading && repos.pageInfo.hasNextPage && (
          <A
            href='#'
            onClick={(e) => {
              e.preventDefault()
              fetchMore({ after: repos.pageInfo.endCursor })
            }}
          >
            {t('repo/table/pageInfo/loadMore')}
          </A>
        )}
      </Label>
    </div>
  ) : null
})

const RepoList = ({
  t,
  data = {},
  router: {
    query,
    query: { q, phase, view, orderBy = `${orderFields[0].field}-DESC` },
  },
  fetchMore,
}) => {
  const [showLoader, setLoader] = useState(false)

  useEffect(() => {
    setLoader(true)
  }, [q, phase])

  useEffect(() => {
    if (showLoader && !data.loading) setLoader(false)
  }, [data.loading])

  const showPhases = view !== 'templates'

  const [orderField, orderDirection] = orderBy.split('-').filter(Boolean)
  const orderCompare = orderDirection === 'DESC' ? descending : ascending

  const getOrder = (field) =>
    [
      field,
      orderField === field
        ? orderDirection === 'DESC'
          ? 'ASC'
          : 'DESC'
        : orderDirection,
    ].join('-')

  const activeOrderField = orderFields.find(
    (order) => order.field === orderField,
  )

  const orderAccessor = activeOrderField
    ? activeOrderField.accessor
    : orderFields[0].accessor

  const colsCount = orderFields.length + 4

  return (
    <>
      <DebouncedSearch />
      {showPhases && data.phasesAgg?.phases.length && (
        <PhaseFilter phases={data.phasesAgg?.phases} />
      )}

      <Table style={{ marginTop: showPhases ? 0 : -15 }}>
        <thead>
          <Tr>
            <Th style={{ width: '28%' }}>{t('repo/table/col/title')}</Th>
            <Th style={{ width: '20%' }}>{t('repo/table/col/credits')}</Th>
            {orderFields.map(({ field, width }) => (
              <ThOrder
                key={field}
                href={{
                  pathname: '/',
                  query: { ...query, orderBy: getOrder(field) },
                }}
                activeDirection={orderDirection}
                activeField={orderField}
                field={field}
                style={{ width }}
              >
                {t(`repo/table/col/${field}`, undefined, field)}
              </ThOrder>
            ))}
            <Th style={{ width: '10%' }}>
              {showPhases ? t('repo/table/col/phase') : ''}
            </Th>

            <Th style={{ width: 70 }} />
          </Tr>
        </thead>
        <tbody>
          {!(showLoader || data.loading || data.error) &&
            data.repos &&
            data.repos.nodes.length === 0 && (
              <Tr>
                <Td colSpan={colsCount}>{t('repo/search/noResults')}</Td>
              </Tr>
            )}
          {!showLoader &&
            data.repos &&
            [...data.repos.nodes]
              .sort((a, b) => orderCompare(orderAccessor(a), orderAccessor(b)))
              .map((repo) => (
                <RepoRow key={repo.id} repo={repo} showPhases={showPhases} />
              ))}
          {(data.loading || data.error) && (
            <tr>
              <td colSpan={colsCount}>
                <Loader loading={data.loading} error={data.error} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <PageInfo
        repos={data.repos}
        loading={data.loading}
        fetchMore={fetchMore}
      />
    </>
  )
}

const RepoListWithQuery = compose(
  withT,
  withRouter,
  graphql(filterAndOrderRepos, {
    options: ({ router }) => ({
      fetchPolicy: 'cache-and-network',
      ssr: false,
      notifyOnNetworkStatusChange: true,
      variables: {
        search:
          router.query?.q && router.query.q.length >= SEARCH_MIN_LENGTH
            ? router.query.q
            : undefined,
        orderBy: { field: 'PUSHED_AT', direction: 'DESC' },
        isTemplate: router.query.view === 'templates',
        ...(router.query?.phase &&
          router.query.view !== 'templates' && {
            phases: [router.query.phase],
          }),
      },
    }),
    props: ({ data, ownProps }) => ({
      data,
      fetchMore: ({ after }) =>
        data.fetchMore({
          variables: {
            after,
            search: ownProps.search,
          },
          updateQuery: (
            previousResult,
            { fetchMoreResult, queryVariables },
          ) => {
            const nodes = [
              ...previousResult.repos.nodes,
              ...fetchMoreResult.repos.nodes,
            ].filter(
              ({ id }, i, all) =>
                // deduplicate by id
                i === all.findIndex((repo) => repo.id === id),
            )
            return {
              ...previousResult,
              totalCount: fetchMoreResult.repos.pageInfo.hasNextPage
                ? fetchMoreResult.repos.totalCount
                : nodes.length,
              repos: {
                ...previousResult.repos,
                ...fetchMoreResult.repos,
                nodes,
              },
            }
          },
        }),
    }),
  }),
)(RepoList)

export default RepoListWithQuery
