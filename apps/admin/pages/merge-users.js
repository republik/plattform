import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import { Container } from '@project-r/styleguide'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import MergeUsers from '../components/Users/Merge'

export default compose(
  withRouter,
  enforceAuthorization(['supporter']),
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
