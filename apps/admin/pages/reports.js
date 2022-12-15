import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import { Container } from '@project-r/styleguide'
import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'
import { withDefaultSSR } from '../lib/apollo'
import LiveReport from '../components/Reports/Live'

const Reports = () => {
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <Container>
            <LiveReport />
          </Container>
        </Content>
      </Body>
    </App>
  )
}

export default withDefaultSSR(
  compose(withRouter, enforceAuthorization(['accountant']))(Reports),
)
