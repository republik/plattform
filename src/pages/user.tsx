import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import withData from '../lib/withData'
import App from '../components/App'
// import User from '../components/User'

// <User params={props.url.query} />
export default withData((props: any) => {
  return <App />
})
