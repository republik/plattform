import React from 'react'
import { compose } from 'react-apollo'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import withData from '../lib/withData'

import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import User from '../components/Users/Detail'

export default compose(
  withData,
  enforceAuthorization(['supporter'])
)(props => {
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <User params={props.url.query} />
        </Content>
      </Body>
    </App>
  )
})
