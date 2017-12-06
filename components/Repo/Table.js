import React, { Component } from 'react'
import { compose } from 'redux'
import { css } from 'glamor'
import { gql, graphql } from 'react-apollo'
import { descending, ascending } from 'd3-array'

import withT from '../../lib/withT'
import { Link } from '../../lib/routes'
import { intersperse } from '../../lib/utils/helpers'
import { swissTime } from '../../lib/utils/format'

import GithubIcon from 'react-icons/lib/fa/github'
import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import {
  linkRule,
  A, Label,
  colors
} from '@project-r/styleguide'

import { Table, Tr, Th, ThOrder, Td, TdNum } from '../Table'

import Loader from '../Loader'

import { GITHUB_ORG, REPO_PREFIX, FRONTEND_BASE_URL } from '../../lib/settings'

import {
  matchType
} from 'mdast-react-render/lib/utils'

import { renderMdast } from 'mdast-react-render'

import EditMetaDate from './EditMetaDate'
import { phases } from './workflow'
import RepoAdd from './Add'

const dateTimeFormat = '%d.%m %H:%M'
const formatDateTime = swissTime.format(dateTimeFormat)

export const displayDateTime = string => string && formatDateTime(new Date(string))

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: A
}
const creditSchema = {
  rules: [link]
}

const styles = {
  container: css({
    padding: 20,
    paddingBottom: 80
  }),
  filterBar: css({
    marginBottom: 20
  }),
  phase: css({
    color: '#fff',
    borderRadius: 3,
    padding: '3px 6px',
    marginRight: 6
  }),
  pageInfo: css({
    float: 'right',
    textAlign: 'right'
  })
}

const phaseForRepo = repo => {
  const phasesReached = phases.filter(phase => {
    if (phase.milestones) {
      return phase.milestones.every(name =>
        repo.milestones.find(milestone => milestone.name === name)
      )
    }
    if (phase.published) {
      if (phase.scheduled) {
        return repo.latestPublications.find(p => p.scheduledAt && !p.live && !p.prepublication)
      }
      if (phase.live) {
        return repo.latestPublications.find(p => p.live && !p.prepublication)
      }
    }
  })

  return phasesReached[phasesReached.length - 1]
}

const orderFields = [
  {
    field: 'PUSHED_AT',
    label: 'Letzte Änderung',
    accessor: repo => new Date(repo.latestCommit.date)
  },
  {
    field: 'PUBLISHED_AT',
    label: 'Publikationsdatum',
    accessor: repo => new Date(repo.latestCommit.document.meta.publishDate)
  },
  {
    field: 'CREATION_DEADLINE',
    label: 'Creation-Deadline',
    accessor: repo => new Date(repo.meta.creationDeadline)
  },
  {
    field: 'PRODUCTION_DEADLINE',
    label: 'Produktions-Deadline',
    accessor: repo => new Date(repo.meta.productionDeadline)
  }
]

const Phase = ({phase, onClick, disabled}) =>
  <span {...styles.phase} style={{
    backgroundColor: disabled ? 'gray' : phase.color,
    cursor: onClick ? 'pointer' : 'default'
  }} onClick={onClick}>
    {phase.name}
  </span>

class RepoList extends Component {
  render () {
    const {
      data,
      orderField,
      orderDirection,
      phase: filterPhase,
      editRepoMeta,
      fetchMore
    } = this.props

    const getParams = ({field = orderField, phase = filterPhase, order = false}) => {
      const params = {
        orderBy: [
          field,
          orderField === field && order
            ? (orderDirection === 'DESC' ? 'ASC' : 'DESC')
            : orderDirection
        ].join('-')
      }
      if (phase) {
        params.phase = phase
      }

      return params
    }

    const orderCompare = orderDirection === 'DESC'
      ? descending : ascending

    const orderAccessor = orderFields.find(order => order.field === orderField).accessor

    return (
      <div {...styles.container}>
        <RepoAdd />

        <div {...styles.filterBar}>
          {phases.map(phase => {
            const active = filterPhase && filterPhase === phase.name
            return (
              <Link key={phase.name} route='index' params={getParams({phase: active ? null : phase.name})}>
                <Phase
                  phase={phase}
                  disabled={filterPhase && !active} />
              </Link>
            )
          })}
          {data.repos && (
            <Label {...styles.pageInfo}>
              {data.repos.nodes.length === data.repos.totalCount
                ? data.repos.totalCount
                : `${data.repos.nodes.length}/${data.repos.totalCount}`
              }
              <br />
              {!data.loading && data.repos.pageInfo.hasNextPage && (
                <a {...linkRule} href='#' onClick={() => {
                  fetchMore({after: data.repos.pageInfo.endCursor})
                }}>
                  Mehr Laden
                </a>
              )}
            </Label>
          )}
        </div>
        <Table>
          <thead>
            <Tr>
              <Th style={{width: '30%'}}>Titel</Th>
              <Th style={{width: '15%'}}>Credits</Th>
              {orderFields.map(({field, label}) => (
                <ThOrder key={field}
                  route='index'
                  params={getParams({field, order: true})}
                  activeDirection={orderDirection}
                  activeField={orderField}
                  field={field}
                  style={{width: '10%'}}>
                  {label}
                </ThOrder>
              ))}
              <Th style={{width: '10%'}}>Phase</Th>
              <Th style={{width: '5%'}} />
            </Tr>
          </thead>
          <tbody>
            {data.loading || data.error
              ? (
                <tr>
                  <td colSpan='8'>
                    <Loader loading={data.loading} error={data.error} style={{height: '80vh'}} />
                  </td>
                </tr>
              )
              : data.repos.nodes
              .map(repo => ({
                phase: phaseForRepo(repo),
                repo
              }))
              .filter(({phase}) => !filterPhase || filterPhase === phase.name)
              .sort((a, b) => orderCompare(orderAccessor(a.repo), orderAccessor(b.repo)))
              .map(({repo, phase}) => {
                const {
                  id,
                  meta: {creationDeadline, productionDeadline},
                  latestCommit: {date, document: {meta}}
                } = repo

                return (
                  <Tr key={id}>
                    <Td>
                      <Label>{meta.format}</Label>
                      {meta.format && <br />}
                      <Link route='repo/tree' params={{repoId: id.split('/')}}>
                        <a {...linkRule} title={id}>
                          {meta.title || id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')}
                        </a>
                      </Link>
                    </Td>
                    <Td>{meta.credits && intersperse(
                      renderMdast(meta.credits.filter(link.matchMdast), creditSchema),
                      () => ', '
                    )}</Td>
                    <TdNum>{displayDateTime(date)}</TdNum>
                    <TdNum>{displayDateTime(meta.publishDate)}</TdNum>
                    <TdNum>
                      <EditMetaDate
                        value={creationDeadline}
                        onChange={(value) => editRepoMeta(
                          {repoId: id, creationDeadline: value}
                        )} />
                    </TdNum>
                    <TdNum>
                      <EditMetaDate
                        value={productionDeadline}
                        onChange={(value) => editRepoMeta(
                          {repoId: id, productionDeadline: value}
                        )} />
                    </TdNum>
                    <Td>
                      <Phase phase={phase} />
                    </Td>
                    <Td style={{textAlign: 'right'}}>
                      {repo.latestPublications
                        .filter(publication => publication.prepublication)
                        .map(publication => (
                          <a key={publication.name} href={`${FRONTEND_BASE_URL}/${publication.commit.document.meta.slug}`}>
                            <LockIcon color={colors.primary} />
                          </a>
                        ))}
                      {' '}
                      {repo.latestPublications
                        .filter(publication => !publication.prepublication && publication.live)
                        .map(publication => (
                          <a key={publication.name} href={`${FRONTEND_BASE_URL}/${publication.commit.document.meta.slug}`}>
                            <PublicIcon color={colors.primary} />
                          </a>
                        ))}
                      {' '}
                      <a href={`https://github.com/${id}`}><GithubIcon color={colors.primary} /></a>
                    </Td>
                  </Tr>
                )
              })
            }
          </tbody>
        </Table>
      </div>
    )
  }
}

const query = gql`
query repos($after: String) {
  repos(first: 100, after: $after) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      id
      meta {
        creationDeadline
        productionDeadline
      }
      latestCommit {
        id
        date
        message
        document {
          meta {
            template
            title
            format
            publishDate
            credits
          }
        }
      }
      milestones {
        name
        immutable
      }
      latestPublications {
        name
        prepublication
        live
        scheduledAt
        commit {
          id
          document {
            meta {
              slug
            }
          }
        }
      }
    }
  }
}
`

const mutation = gql`
mutation editRepoMeta($repoId: ID!, $creationDeadline: DateTime, $productionDeadline: DateTime) {
  editRepoMeta(repoId: $repoId, creationDeadline: $creationDeadline, productionDeadline: $productionDeadline) {
    id
    meta {
      creationDeadline
      productionDeadline
    }
  }
}
`

const RepoListWithQuery = compose(
  withT,
  graphql(query, {
    options: {
      notifyOnNetworkStatusChange: true
    },
    props: ({data}) => ({
      data,
      fetchMore: ({after}) => data.fetchMore({
        variables: {
          after
        },
        updateQuery: (previousResult, { fetchMoreResult, queryVariables }) => {
          const nodes = [
            ...previousResult.repos.nodes,
            ...fetchMoreResult.repos.nodes
          ].filter(({id}, i, all) =>
            // deduplicate by id
            i === all.findIndex(repo => repo.id === id)
          )
          return {
            ...previousResult,
            totalCount: fetchMoreResult.repos.pageInfo.hasNextPage
              ? fetchMoreResult.repos.totalCount
              : nodes.length,
            repos: {
              ...previousResult.repos,
              ...fetchMoreResult.repos,
              nodes
            }
          }
        }
      })
    })
  }),
  graphql(mutation, {
    props: ({mutate}) => ({
      editRepoMeta: (variables) =>
        mutate({variables})
    })
  })
)(RepoList)

RepoListWithQuery.defaultProps = {
  orderField: orderFields[0].field,
  orderDirection: 'DESC'
}

export default RepoListWithQuery
