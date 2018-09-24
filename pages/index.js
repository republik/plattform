import React from 'react'
import {withRouter} from 'next/router'
import {compose} from 'redux'

import withAuthorization from '../components/Auth/withAuthorization'

import Frame from '../components/Frame'
import RepoTable from '../components/Repo/Table'

const Index = ({ router: url }) => {
  const [orderField, orderDirection] = (url.query.orderBy || '')
    .split('-')
    .filter(Boolean)
  return (
    <Frame>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav url={url} />
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <RepoTable
          orderField={orderField}
          orderDirection={orderDirection}
          phase={url.query.phase}
          search={url.query.q} />
      </Frame.Body>
    </Frame>
  )
}

export default compose(
  withRouter,
  withAuthorization(['editor'])
)(Index)
