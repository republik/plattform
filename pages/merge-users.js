import React from 'react'
import { compose } from 'react-apollo'
import { Container } from '@project-r/styleguide'
import withData from '../lib/withData'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import MergeUsers from '../components/Users/Merge'

export default compose(
  withData,
  enforceAuthorization(['supporter'])
)(() => {
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <Container>
            <MergeUsers />
          </Container>
        </Content>
      </Body>
    </App>
  )
})
