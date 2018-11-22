import React from 'react'
import { compose } from 'react-apollo'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header
} from '../components/Layout'
import Users from '../components/Users/List'
import { Router } from '../server/routes'

const changeHandler = params => {
  Router.replaceRoute('users', params, { shallow: true })
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
          <Users
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
