import { compose } from 'react-apollo'
import { withRouter } from 'next/router'

import App from '../components/App'
import { enforceAuthorization } from '../components/Auth/withAuthorization'

import { Body, Content, Header } from '../components/Layout'
import Payments from '../components/Payments/List'
import { Router } from '../server/routes'

const changeHandler = (params) => {
  Router.replaceRoute('payments', params, { shallow: true })
}

export default compose(
  withRouter,
  enforceAuthorization(['supporter']),
)((props) => {
  return (
    <App>
      <Body>
        <Header search={props.router.query.search} />
        <Content id='content'>
          <Payments params={props.router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
})
