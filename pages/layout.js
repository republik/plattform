import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header,
  Footer
} from '../components/Layout'

export default withData(() => {
  return (
    <App>
      <Body>
        <Header />
        <Content>foobar</Content>
        <Footer>
          <h3>Column</h3>
        </Footer>
      </Body>
    </App>
  )
})
