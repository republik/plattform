'use client'

import { useApolloClient } from '@apollo/client'

import App from '@/components/App'
import { Body, Content, Header } from '@/components/Layout'
import MergeUsers from '@/components/Users/Merge'
import { Container } from '@project-r/styleguide'

const MergeUser = () => {
  const apolloClient = useApolloClient()
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <Container>
            <MergeUsers apolloClient={apolloClient} />
          </Container>
        </Content>
      </Body>
    </App>
  )
}

export default MergeUser
