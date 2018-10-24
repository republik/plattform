import React from 'react'
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

export default withData(props => {
  return (
    <App>
      <Body>
        <Header search={props.url.query.search} />
        <Content id="content">
          <Users
            params={props.url.query}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
})
