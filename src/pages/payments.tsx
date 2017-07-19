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
import Payments from '../components/Payments/List'
import { default as Routes } from '../routes'

const changeHandler = (params: any) => {
  Routes.Router.pushRoute('payments', params)
}

export default withData((props: any) => {
  return (
    <App>
      <Body>
        <Header />
        <Content id="content">
          <Payments
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
        <Footer>
          <h3>Column</h3>
        </Footer>
      </Body>
    </App>
  )
})
