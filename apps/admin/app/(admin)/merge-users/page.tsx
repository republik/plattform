'use client'

import { useApolloClient } from '@apollo/client'

import App from '@/components/App'
import { Body, Content, Header } from '@/components/Layout'
import MergeUsers from '@/components/Users/Merge'

const MergeUser = () => {
  const apolloClient = useApolloClient()
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <MergeUsers apolloClient={apolloClient} />
        </Content>
      </Body>
    </App>
  )
}

export default MergeUser
