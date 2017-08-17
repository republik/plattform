import * as React from 'react'
import { Container } from '@project-r/styleguide'
import withData from '../lib/withData'
import App from '../components/App'
import {
  Body,
  Content,
  Header,
  Footer
} from '../components/Layout'
import MergeUsers from '../components/Users/Merge'

export default withData((props: any) => {
  const { userId } = props.url.query
  return (
    <App>
      <Body>
        <Header />
        <Content id="content">
          <Container>
          <MergeUsers />
          </Container>
        </Content>
      </Body>
    </App>
  )
})
