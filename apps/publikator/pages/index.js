import { A } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'

import Link from 'next/link'
import { withRouter } from 'next/router'

import withAuthorization from '../components/Auth/withAuthorization'
import Calendar from '../components/Calendar'
import Frame from '../components/Frame'
import RepoAdd from '../components/Repo/Add'
import RepoTable from '../components/Repo/Table'
import { withDefaultSSR } from '../lib/apollo/helpers'
import withT from '../lib/withT'

const styles = {
  defaultContainer: css({
    padding: 20,
  }),
}

const IndexNavLink = ({ isActive, href, label }) =>
  isActive ? (
    <span>{label} </span>
  ) : (
    <Link href={href} passHref legacyBehavior>
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
      <IndexNavLink
        href={{
          pathname: '/authors',
        }}
        label={'Autoren'}
        isActive={query.view === 'authors'}
      />
    </span>
  )
})

const Index = ({
  router: {
    query: { view },
  },
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

export default withDefaultSSR(compose(withRouter, withAuthorization)(Index))
