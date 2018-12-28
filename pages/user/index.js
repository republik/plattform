import React from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'

import { enforceAuthorization } from '../../components/Auth/withAuthorization'
import App from '../../components/App'
import { Body, Content, Header } from '../../components/Layout'

import { css } from 'glamor'

import User from '../../components/Users/Particulars'
import Email from '../../components/Users/Email'
import NewsletterSubscriptions from '../../components/Users/NewsletterSubscriptions'
import Roles from '../../components/Users/Roles'
import ProfileHeader from '../../components/Users/ProfileHeader'
import Memberships from '../../components/Users/Memberships'
import Pledges from '../../components/Users/Pledges'
import LatestActivity from '../../components/Users/LatestActivity'

const styles = {
  row: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    '& > *': {
      flex: '0 0 25%'
    }
  }),
  fifty: css({
    flex: '0 0 50%'
  })
}

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
            section={'index'}
          />
          <div {...styles.row}>
            <div>
              <User userId={userId} />
              <Email userId={userId} />
            </div>
            <div>
              <NewsletterSubscriptions userId={userId} />
              <Roles userId={userId} />
            </div>
            <div {...styles.fifty}>
              <LatestActivity userId={userId} />
            </div>
            <div {...styles.fifty}>
              <Memberships userId={userId} />
            </div>
            <div {...styles.fifty}>
              <Pledges userId={userId} />
            </div>
          </div>
        </Content>
      </Body>
    </App>
  )
})
