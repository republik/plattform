import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import User from '../components/Users/Detail'

export default withData(props => {
  return (
    <App>
      <Body>
        <Header />
        <Content id="content">
          <User params={props.url.query} />
        </Content>
      </Body>
    </App>
  )
})
