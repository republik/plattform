import React from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import Users from '../components/Users/List'
import { Router } from '../server/routes'

const changeHandler = (params) => {
  Router.replaceRoute('users', params, { shallow: true })
}

export default compose(
  withRouter,
  enforceAuthorization(['supporter']),
)((props) => {
  return (
    <App>
      <Body>
        <Header search={props.router.query.search} />
        <Content id='content'>
          <Users params={props.router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
})
