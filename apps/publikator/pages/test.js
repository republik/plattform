import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { css } from 'glamor'

import { Editor, flyerSchema, A } from '@project-r/styleguide'

import { Link } from '../lib/routes'
import withT from '../lib/withT'

import withAuthorization from '../components/Auth/withAuthorization'
import Calendar from '../components/Calendar'
import Frame from '../components/Frame'
import MetaDataForm from '../components/MetaDataForm'
import RepoTable from '../components/Repo/Table'
import RepoAdd from '../components/Repo/Add'
import { useState } from 'react'

const IndexNavLink = ({ isActive, route, params, label }) =>
  isActive ? (
    <span>{label} </span>
  ) : (
    <Link route={route} params={params} passHref>
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
        route='index'
        params={{ ...query, view: null }}
        label={t('repo/table/nav/documents')}
        isActive={!query.view}
      />
      {views.map((view) => (
        <span key={view}>
          <span>&nbsp;</span>
          <IndexNavLink
            route='index'
            params={{ ...query, view }}
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
}) => {
  const [value, setValue] = useState([
    {
      type: 'flyerTileOpening',
      children: [
        {
          type: 'headline',
          children: [
            { text: 'Guten Morgen,' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'schoen sind Sie da!' },
          ],
        },
      ],
    },
    {
      type: 'flyerTileClosing',
      children: [
        {
          type: 'headline',
          children: [{ text: 'Bis nachher!' }],
        },
        {
          type: 'flyerSignature',
          children: [
            {
              text: 'Ihre Crew der Republik',
            },
          ],
        },
      ],
    },
  ])
  const [metaData, setMetaData] = useState({
    slug: '',
    title: '',
  })
  const structure = [
    {
      type: 'flyerTileOpening',
    },
    {
      type: ['flyerTile', 'flyerTileMeta'],
      repeat: true,
    },
    {
      type: 'flyerTileClosing',
    },
  ]
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
        <Editor
          value={value}
          setValue={(newValue) => {
            setValue(newValue)
          }}
          structure={structure}
          config={{ schema: flyerSchema }}
        />
        <MetaDataForm metaData={metaData} setMetaData={setMetaData} />
      </Frame.Body>
    </Frame>
  )
}

export default compose(withRouter, withAuthorization(['editor']))(Index)
