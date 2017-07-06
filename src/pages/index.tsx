import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import withData from '../lib/withData'
import App from '../components/App'
import SignIn from '../components/Auth/SignIn'

export default withData((props: any) => {
  return (
    <App>
      <SignIn />
    </App>
  )
})
