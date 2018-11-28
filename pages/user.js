import React from 'react'
import { withRouter } from 'next/router'

import { compose } from 'react-apollo'
import { enforceAuthorization } from '../components/Auth/withAuthorization'

import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import User from '../components/Users/Detail'

export default compose(
  withRouter,
  enforceAuthorization(['supporter'])
)(props => {
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <User params={props.router.query} />
        </Content>
      </Body>
    </App>
  )
})
