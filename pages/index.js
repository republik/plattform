import React from 'react'
import {compose} from 'redux'

import withData from '../lib/apollo/withData'
import withAuthorization from '../components/Auth/withAuthorization'

import Frame from '../components/Frame'
import RepoTable from '../components/Repo/Table'

const Index = ({ url }) => {
  const [orderField, orderDirection] = (url.query.orderBy || '')
    .split('-')
    .filter(Boolean)
  return (
    <Frame url={url} raw>
      <RepoTable orderField={orderField} orderDirection={orderDirection} />
    </Frame>
  )
}

export default compose(
  withData,
  withAuthorization(['editor'])
)(Index)
