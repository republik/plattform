import React from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'

import withAuthorization from '../components/Auth/withAuthorization'

import Frame from '../components/Frame'
import RepoTable from '../components/Repo/Table'
import { Link } from '../lib/routes'
import { linkRule } from '@project-r/styleguide'
import withT from '../lib/withT'
import RepoAdd from '../components/Repo/Add'
import { css } from 'glamor'

const styles = {
  container: css({
    padding: 20,
    paddingBottom: 80
  })
}

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
  const views = ['templates', 'calendar']

  return (
    <span>
      <IndexNavLink
        route='index'
        params={{ ...query, view: null }}
        label={t('repo/table/nav/documents')}
        isActive={!query.view}
      />
      {views.map(view => (
        <>
          <span>&nbsp;</span>
          <IndexNavLink
            route='index'
            params={{ ...query, view, phase: null }}
            label={t(`repo/table/nav/${view}`)}
            isActive={query.view === view}
          />
        </>
      ))}
    </span>
  )
})

const Index = ({
  router: {
    query: { view }
  }
}) => (
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
      <div {...styles.container}>
        {view === 'calendar' ? (
          <span>Calendar</span>
        ) : (
          <RepoAdd isTemplate={view === 'templates'} />
        )}
        <RepoTable />
      </div>
    </Frame.Body>
  </Frame>
)

export default compose(withRouter, withAuthorization(['editor']))(Index)
