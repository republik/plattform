import * as React from 'react'
import App from '../components/App'
import Header from '../components/Header'
import UserTable from '../components/UserTable'
import withData from '../lib/withData'

export default withData((props: any) => {
  return (
    <App>
      <UserTable params={props.url.query} />
    </App>
  )
})
