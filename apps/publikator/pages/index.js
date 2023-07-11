import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { css } from 'glamor'

import { A, HeaderHeightProvider } from '@project-r/styleguide'

import Link from 'next/link'
import withT from '../lib/withT'

import withAuthorization from '../components/Auth/withAuthorization'
import Calendar from '../components/Calendar'
import Frame from '../components/Frame'
import RepoTable from '../components/Repo/Table'
import RepoAdd from '../components/Repo/Add'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { HEADER_HEIGHT } from '../components/Frame/constants'

const styles = {
  defaultContainer: css({
    padding: 20,
  }),
}

const IndexNavLink = ({ isActive, href, label }) =>
  isActive ? (
    <span>{label} </span>
  ) : (
    <Link href={href} passHref>
      <A>{label} </A>
    </Link>
  )

const IndexNav = compose(
  withRouter,
  withT,
)(({ router: { query }, t }) => {
  const views = ['templates', 'calendar']

  return (
    <span>
      <IndexNavLink
        href={{
          pathname: '/',
          query: { ...query, view: null },
        }}
        label={t('repo/table/nav/documents')}
        isActive={!query.view}
      />
      {views.map((view) => (
        <span key={view}>
          <span>&nbsp;</span>
          <IndexNavLink
            href={{
              pathname: '/',
              query: { ...query, view },
            }}
            label={t(`repo/table/nav/${view}`)}
            isActive={query.view === view}
          />
        </span>
      ))}
    </span>
  )
})

const Index = ({
  router: {
    query: { view },
  },
}) => (
  <Frame>
    <HeaderHeightProvider
      config={[
        {
          minWidth: 0,
          headerHeight: HEADER_HEIGHT,
        },
      ]}
    />
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
      {view === 'calendar' ? (
        <Calendar />
      ) : (
        <div {...styles.defaultContainer}>
          <RepoAdd isTemplate={view === 'templates'} />
          <RepoTable />
        </div>
      )}
    </Frame.Body>
  </Frame>
)

export default withDefaultSSR(
  compose(withRouter, withAuthorization(['editor']))(Index),
)
