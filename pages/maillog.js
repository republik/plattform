import React from 'react'
import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import App from '../components/App'
import { enforceAuthorization } from '../components/Auth/withAuthorization'

import {
  Body,
  Content,
  Header
} from '../components/Layout'
import MailLogPage from '../components/MailLog/Page'
import { Router } from '../server/routes'

const changeHandler = params => {
  Router.replaceRoute('maillog', params, { shallow: true })
}

export default compose(
  withRouter,
  enforceAuthorization(['supporter'])
)(props => {
  return (
    <App>
      <Body>
        <Header search={props.router.query.search} />
        <Content id='content'>
          <MailLogPage
            params={props.router.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
