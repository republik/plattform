import React from 'react'
import {compose} from 'redux'

import withData from '../lib/apollo/withData'
import withAuthorization from '../components/Auth/withAuthorization'

import Frame from '../components/Frame'
import RepoList from '../components/RepoList'

const Index = ({ url }) => (
  <Frame url={url}>
    <RepoList />
  </Frame>
)

export default compose(
  withData,
  withAuthorization(['editor'])
)(Index)
