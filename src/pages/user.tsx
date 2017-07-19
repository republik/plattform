import * as React from 'react'
import { compose } from 'redux'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header,
  Footer
} from '../components/Layout'
import User from '../components/Users/Detail'

export default withData((props: any) => {
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
