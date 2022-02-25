import React from 'react'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import App from '../components/App'
import enforceAuthorization from '../components/Auth/withAuthorization'

import { Body, Content, Header } from '../components/Layout'
import PostfinancePayments from '../components/PostfinancePayments/List'
import { Router } from '../server/routes'

const changeHandler = (params) => {
  Router.replaceRoute('postfinance-payments', params, { shallow: true })
}

export default compose(
  withRouter,
  enforceAuthorization(['supporter', 'accountant']),
)((props) => {
  return (
    <App>
      <Body>
        <Header search={props.router.query.search} />
        <Content id='content'>
          <PostfinancePayments
            params={props.router.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
