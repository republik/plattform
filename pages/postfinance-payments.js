import React from 'react'
import App from '../components/App'
import withAuthorization from '../components/Auth/withAuthorization'
import withData from '../lib/withData'

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

export default withData(withAuthorization(['supporter', 'accountant'])(props => {
  return (
    <App>
      <Body>
        <Header search={props.url.query.search} />
        <Content id='content'>
          <PostfinancePayments
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
}))
