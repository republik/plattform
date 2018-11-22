import React from 'react'
import { compose } from 'react-apollo'
import App from '../components/App'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import withData from '../lib/withData'

import {
  Body,
  Content,
  Header
} from '../components/Layout'
import Payments from '../components/Payments/List'
import { Router } from '../server/routes'

const changeHandler = params => {
  Router.replaceRoute('payments', params, { shallow: true })
}

export default compose(
  withData,
  enforceAuthorization(['supporter'])
)(props => {
  return (
    <App>
      <Body>
        <Header search={props.url.query.search} />
        <Content id='content'>
          <Payments
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
