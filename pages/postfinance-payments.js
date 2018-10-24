import React from 'react'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import PostfinancePayments from '../components/PostfinancePayments/List'
import { Router } from '../server/routes'

const changeHandler = params => {
  Router.replaceRoute('postfinance-payments', params, { shallow: true })
}

export default withData(props => {
  return (
    <App>
      <Body>
        <Header search={props.url.query.search} />
        <Content id="content">
          <PostfinancePayments
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
