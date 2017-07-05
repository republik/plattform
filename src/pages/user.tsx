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
import User from '../components/User'

export default withData((props: any) => {
  return (
    <App>
      <User params={props.url.query} />
    </App>
  )
})
