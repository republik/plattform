import * as React from 'react'
import App from '../components/App'
import Header from '../components/Header'
import Submit from '../components/Submit'
import PostList from '../components/PostList'
import withData from '../lib/withData'

export default withData((props: any) =>
  <App>
    <Header pathname={props.url.pathname} />
    <Submit />
    <PostList />
  </App>
)
