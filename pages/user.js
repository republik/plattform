import React from 'react'
import withAuthorization from '../components/Auth/withData'
import withData from '../lib/withData'

import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import User from '../components/Users/Detail'

export default withData(withAuthorization(['supporter'])(props => {
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
}))
