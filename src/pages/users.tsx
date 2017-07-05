import * as React from 'react'
import { default as Router } from 'next/router'
import { css, StyleAttribute } from 'glamor'
import { UserTableParams } from '../types/users'
import withData from '../lib/withData'
import App from '../components/App'
import UserTable from '../components/UserTable'
import UserTableForm from '../components/UserTableForm'
import Container from '../components/Container'
import Header from '../components/Header'
import Body from '../components/Body'

const changeHandler = (params: UserTableParams) =>
  Router.push({
    pathname: '/',
    query: params
  })

export default withData((props: any) => {
  return (
    <App>
      <Container>
        <Header>
          <UserTableForm />
        </Header>
        <Body>
          <UserTable
            params={props.url.query}
            onChange={changeHandler}
          />
        </Body>
      </Container>
    </App>
  )
})
