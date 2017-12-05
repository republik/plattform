import React, { Component } from 'react'
import {compose} from 'redux'
import { css } from 'glamor'
import { gql, graphql } from 'react-apollo'

import withT from '../../lib/withT'
import { Router, Link } from '../../lib/routes'
import slugify from '../../lib/utils/slug'
import { intersperse } from '../../lib/utils/helpers'
import { swissTime } from '../../lib/utils/format'

import GithubIcon from 'react-icons/lib/fa/github'

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

import { GITHUB_ORG, TEMPLATES, REPO_PREFIX } from '../../lib/settings'

import schemas from '../Templates'

import {
  matchType
} from 'mdast-react-render/lib/utils'
import { renderMdast } from 'mdast-react-render'

const dateTimeFormat = '%d.%m %H:%M'
const formatDateTime = swissTime.format(dateTimeFormat)

const displayDateTime = string => string && formatDateTime(new Date(string))

const br = {
  matchMdast: matchType('break'),
  component: () => <br />,
  isVoid: true
}
const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: A
}
const creditSchema = {
  rules: [link, br]
}

let templateKeys = Object.keys(schemas)
if (TEMPLATES) {
  const allowedTemplates = TEMPLATES.split(',')
  templateKeys = templateKeys
    .filter(key => allowedTemplates.indexOf(key) !== -1)
}

const styles = {
  new: css({
    maxWidth: 600,
    paddingBottom: 100
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
  })
}

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
    const { t, data, orderField, orderDirection } = this.props
    const { title, template, dirty, error } = this.state

    const templateOptions = templateKeys.map(key => ({
      value: key,
      text: t(`repo/list/add/template/${key}`, null, key)
    }))

    return (
      <div style={{padding: 20}}>
        <Interaction.H1 style={{paddingBottom: 20}}>{t('repo/list/title')}</Interaction.H1>
        <Table>
          <thead>
            <Tr>
              <Th style={{width: '30%'}}>Titel</Th>
              <Th style={{width: '15%'}}>Credits</Th>
              {[
                {field: 'PUSHED_AT', label: 'Letzte Änderung'},
                {field: 'PUBLISHED_AT', label: 'Publikationsdatum'},
                {field: 'CREATION_DEADLINE', label: 'Creation-Deadline'},
                {field: 'PRODUCTION_DEADLINE', label: 'Produktions-Deadline'}
              ].map(({field, label}) => (
                <ThOrder key={field}
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
                <tr><td colspan='8'>
                  <Loader loading={data.loading} error={data.error} style={{height: '80vh'}} />
                </td></tr>
              )
              : data.repos
              .map(({id, meta: {creationDeadline, productionDeadline}, latestCommit: {date, document: {meta}}}) => (
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
                  <TdNum>{displayDateTime(creationDeadline)}</TdNum>
                  <TdNum>{displayDateTime(productionDeadline)}</TdNum>
                  <td />
                  <Td style={{textAlign: 'right'}}>
                    <a href={`https://github.com/${id}`}><GithubIcon color={colors.primary} /></a>
                  </Td>
                </Tr>
              ))
            }
          </tbody>
        </Table>

        <br /><br />

        <div {...styles.new}>
          <Interaction.H2>{t('repo/list/add/title')}</Interaction.H2>
          <form {...styles.form} onSubmit={e => this.onSubmit(e)}>
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
              <Button block>
                {t('repo/list/add/submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

const query = gql`
query repos($orderField: RepoOrderField!, $orderDirection: OrderDirection!) {
  repos(orderBy: {field: $orderField, direction: $orderDirection}) {
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
  }
}
`

const RepoListWithQuery = compose(
  withT,
  graphql(query)
)(RepoList)

RepoListWithQuery.defaultProps = {
  orderField: 'PUSHED_AT',
  orderDirection: 'DESC'
}

export default RepoListWithQuery
