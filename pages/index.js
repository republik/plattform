import React from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'

import withAuthorization from '../components/Auth/withAuthorization'

import Frame from '../components/Frame'
import RepoTable from '../components/Repo/Table'
import { Link } from '../lib/routes'
import { linkRule } from '@project-r/styleguide'
import withT from '../lib/withT'

const IndexNavLink = ({ isActive, route, params, label }) =>
  isActive ? (
    <span>{label} </span>
  ) : (
    <Link route={route} params={params}>
      <a {...linkRule}>{label} </a>
    </Link>
  )

const IndexNav = compose(
  withRouter,
  withT
)(({ router: { query }, t }) => {
  const onTemplates = query.templates
  return (
    <span>
      <IndexNavLink
        route='index'
        params={{}}
        label={t('repo/table/nav/documents')}
        isActive={!onTemplates}
      />
      <span>&nbsp;</span>
      <IndexNavLink
        route='index'
        params={{ templates: true }}
        label={t('repo/table/nav/templates')}
        isActive={onTemplates}
      />
    </span>
  )
})

const Index = ({ router: { query } }) => {
  const [orderField, orderDirection] = (query.orderBy || '')
    .split('-')
    .filter(Boolean)
  return (
    <Frame>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <IndexNav />
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <RepoTable
          orderField={orderField}
          orderDirection={orderDirection}
          phase={query.phase}
          search={query.q}
        />
      </Frame.Body>
    </Frame>
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
