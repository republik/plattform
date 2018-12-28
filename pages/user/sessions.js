import React from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'

import { enforceAuthorization } from '../../components/Auth/withAuthorization'
import App from '../../components/App'
import { Body, Content, Header } from '../../components/Layout'

import ProfileHeader from '../../components/Users/ProfileHeader'
import Sessions from '../../components/Users/Sessions'

export default compose(
  withRouter,
  enforceAuthorization(['supporter'])
)(props => {
  const { userId } = props.router.query
  return (
    <App>
      <Body>
        <Header />
        <Content id="content">
          <ProfileHeader
            userId={userId}
            section={'sessions'}
          />
          <Sessions userId={userId} />
        </Content>
      </Body>
    </App>
  )
})
