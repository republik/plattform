import React, { Fragment } from 'react'
import { withRouter } from 'next/router'
import { compose } from 'react-apollo'

import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body, Content, Header } from '../components/Layout'

import { css } from 'glamor'

import User from '../components/Users/Particulars'
import Email from '../components/Users/Email'
import NewsletterSubscriptions from '../components/Users/NewsletterSubscriptions'
import Roles from '../components/Users/Roles'
import ProfileHeader from '../components/Users/ProfileHeader'
import Memberships from '../components/Users/Memberships'
import Pledges from '../components/Users/Pledges'
import AdminNotes from '../components/Users/AdminNotes'
import AuthSettings from '../components/Users/AuthSettings'
import LatestActivity from '../components/Users/LatestActivity'

import EventLog from '../components/Users/EventLog'
import Access from '../components/Users/Access'
import Sessions from '../components/Users/Sessions'
import Actions from '../components/Users/Actions'
import MailLog from '../components/Users/MailLog'

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

const SectionSwitch = ({ userId, section }) => {
  if (section === 'access-grants') {
    return <Access userId={userId} />
  }
  if (section === 'maillog') {
    return <MailLog userId={userId} />
  }
  if (section === 'sessions') {
    return <Fragment>
      <Sessions userId={userId} />
      <EventLog userId={userId} />
    </Fragment>
  }

  return <div {...styles.row}>
    <div>
      <User userId={userId} />
      <Email userId={userId} />
    </div>
    <div>
      <NewsletterSubscriptions userId={userId} />
      <Roles userId={userId} />
      <Actions userId={userId} />
    </div>
    <div {...styles.fifty}>
      <AuthSettings userId={userId} />
      <LatestActivity userId={userId} />
      <AdminNotes userId={userId} />
    </div>
    <div {...styles.fifty}>
      <Memberships userId={userId} />
    </div>
    <div {...styles.fifty}>
      <Pledges userId={userId} />
    </div>
  </div>
}

export default compose(
  withRouter,
  enforceAuthorization(['supporter'])
)(props => {
  const { userId, section = 'index' } = props.router.query
  return (
    <App>
      <Body>
        <Header />
        <Content id="content">
          <ProfileHeader
            userId={userId}
            section={section}
          />
          <SectionSwitch userId={userId} section={section} />
        </Content>
      </Body>
    </App>
  )
})
