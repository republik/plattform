import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import { Container } from '@project-r/styleguide'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import MergeUsers from '../components/Users/Merge'
import { withDefaultSSR } from '../lib/apollo'
import { useApolloClient } from '@apollo/client'

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

export default withDefaultSSR(
  compose(withRouter, enforceAuthorization(['supporter']))(MergeUser),
)
