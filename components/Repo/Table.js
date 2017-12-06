import React, { Component } from 'react'
import { compose } from 'redux'
import { css } from 'glamor'
import { gql, graphql } from 'react-apollo'
import { descending, ascending } from 'd3-array'

import withT from '../../lib/withT'
import { Router, Link } from '../../lib/routes'
import slugify from '../../lib/utils/slug'
import { intersperse } from '../../lib/utils/helpers'
import { swissTime } from '../../lib/utils/format'

import GithubIcon from 'react-icons/lib/fa/github'
import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import {
  Interaction,
  Field, Button,
  Dropdown,
  linkRule,
  mediaQueries,
  A, Label,
  colors
} from '@project-r/styleguide'

import { Table, Tr, Th, ThOrder, Td, TdNum } from '../Table'

import Loader from '../Loader'

import { GITHUB_ORG, TEMPLATES, REPO_PREFIX, FRONTEND_BASE_URL } from '../../lib/settings'

import schemas from '../Templates'

import {
  matchType
} from 'mdast-react-render/lib/utils'

import { renderMdast } from 'mdast-react-render'

import { phases } from '../EditSidebar/Checklist'
import EditMetaDate from './EditMetaDate'

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

let templateKeys = Object.keys(schemas)
if (TEMPLATES) {
  const allowedTemplates = TEMPLATES.split(',')
  templateKeys = templateKeys
    .filter(key => allowedTemplates.indexOf(key) !== -1)
}

const styles = {
  container: css({
    padding: 20,
    paddingBottom: 80
  }),
  new: css({
    maxWidth: 600,
    paddingBottom: 60
  }),
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    margin: '0 auto'
  }),
  select: css({
    width: '100%',
    marginTop: 10
  }),
  input: css({
    width: '100%',
    [mediaQueries.mUp]: {
      marginRight: 10,
      marginBottom: 0,
      width: '58%'
    }
  }),
  button: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '38%',
      minWidth: 160
    }
  }),
  phases: css({
    marginBottom: 20
  }),
  phase: css({
    color: '#fff',
    borderRadius: 3,
    padding: '3px 6px',
    marginRight: 6
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
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      template: ''
    }
  }
  onSubmit (event) {
    event.preventDefault()

    const { title, template, error } = this.state
    if (error || !title) {
      this.handleTitle(title, true)
      return
    }
    const schema = schemas[template]
    const prefix = [
      REPO_PREFIX,
      schema.repoPrefix
    ].filter(Boolean).join('')
    const slug = [
      prefix,
      slugify(title)
    ].join('')

    Router.replaceRoute('repo/edit', {
      repoId: [GITHUB_ORG, slug],
      commitId: 'new',
      title,
      template
    }).then(() => {
      window.scrollTo(0, 0)
    })
  }
  handleTitle (value, shouldValidate) {
    const { t } = this.props

    this.setState({
      title: value,
      dirty: shouldValidate,
      error: (
        value.trim().length <= 0 && t('repo/list/add/titleField/error')
      )
    })
  }
  render () {
    const {
      t,
      data,
      orderField,
      orderDirection,
      phase: filterPhase,
      editRepoMeta
    } = this.props
    const { title, template, dirty, error } = this.state

    const templateOptions = templateKeys.map(key => ({
      value: key,
      text: t(`repo/list/add/template/${key}`, null, key)
    }))

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
        <div {...styles.new}>
          <Interaction.H2>{t('repo/list/add/title')}</Interaction.H2>
          <form {...styles.form} onSubmit={e => this.onSubmit(e)} onKeyPress={e => {
            if (e.key === 'Enter') {
              this.onSubmit(e)
            }
          }}>
            <div {...styles.select}>
              <Dropdown
                label='Vorlage'
                items={templateOptions}
                value={template}
                onChange={item => {
                  this.setState({template: item.value})
                }} />
            </div>
            <div {...styles.input}>
              <Field
                label={t('repo/list/add/titleField/label')}
                value={title}
                onChange={(_, value, shouldValidate) => {
                  this.handleTitle(value, shouldValidate)
                }}
                error={dirty && error}
              />
            </div>
            <div {...styles.button}>
              <Button type='submit' block>
                {t('repo/list/add/submit')}
              </Button>
            </div>
          </form>
        </div>

        <div {...styles.phases}>
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
                          {repoId: id, creationDeadline: value},
                          {orderField, orderDirection}
                        )} />
                    </TdNum>
                    <TdNum>
                      <EditMetaDate
                        value={productionDeadline}
                        onChange={(value) => editRepoMeta(
                          {repoId: id, productionDeadline: value},
                          {orderField, orderDirection}
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
query repos {
  repos {
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
  graphql(query),
  graphql(mutation, {
    props: ({mutate}) => ({
      editRepoMeta: (variables) =>
        mutate({
          variables
        })
    })
  })
)(RepoList)

RepoListWithQuery.defaultProps = {
  orderField: orderFields[0].field,
  orderDirection: 'DESC'
}

export default RepoListWithQuery
