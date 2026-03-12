import { Fragment } from 'react'
import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'

import { enforceAuthorization } from '../../components/Auth/withAuthorization'
import App from '../../components/App'

import { css } from '@republik/theme/css'

import User from '../../components/Users/Particulars'
import Email from '../../components/Users/Email'
import NewsletterSubscriptions from '../../components/Users/NewsletterSubscriptions'
import Roles from '../../components/Users/Roles'
import ProfileHeader from '../../components/Users/ProfileHeader'
import Memberships from '../../components/Users/Memberships'
import Pledges from '../../components/Users/Pledges'
import AdminNotes from '../../components/Users/AdminNotes'
import AuthSettings from '../../components/Users/AuthSettings'

import Access from '../../components/Users/Access'
import Sessions from '../../components/Users/Sessions'
import Actions from '../../components/Users/Actions'
import Dialog from '../../components/Users/Dialog'
import Mailbox from '../../components/Users/Mailbox'
import { Body, Content } from '../../components/Layout'
import Header from '../../components/Layout/Header'
import { withDefaultSSR } from '../../lib/apollo'
import Links from '../../components/Users/Links'
import Campaigns from '../../components/Users/Campaigns'

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  }),
  span1: css({
    gridColumn: 'span 1',
  }),
  span2: css({
    gridColumn: 'span 2',
  }),
}

const SectionSwitch = ({ userId, section }) => {
  if (section === 'access-grants') {
    return <Access userId={userId} />
  }
  if (section === 'mailbox') {
    return <Mailbox userId={userId} />
  }
  if (section === 'sessions') {
    return (
      <Fragment>
        <Sessions userId={userId} />
      </Fragment>
    )
  }
  if (section === 'dialog') {
    return <Dialog userId={userId} />
  }

  return (
    <div className={styles.grid}>
      <div className={styles.span1}>
        <User userId={userId} />
        <Email userId={userId} />
      </div>
      <div className={styles.span1}>
        <NewsletterSubscriptions userId={userId} />
        <Roles userId={userId} />
        <Actions userId={userId} />
      </div>
      <div className={styles.span2}>
        <AuthSettings userId={userId} />
        <Mailbox userId={userId} narrow={3} />
        <Links userId={userId} />
        <Campaigns userId={userId} />
        <AdminNotes userId={userId} />
      </div>
      <div className={styles.span2}>
        <Memberships userId={userId} />
      </div>
      <div className={styles.span2}>
        <Pledges userId={userId} />
      </div>
    </div>
  )
}

const UserPage = (props) => {
  const { userId, section = 'index' } = props.router.query
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <ProfileHeader userId={userId} section={section} />
          <SectionSwitch userId={userId} section={section} />
        </Content>
      </Body>
    </App>
  )
}

export default withDefaultSSR(
  compose(withRouter, enforceAuthorization(['supporter']))(UserPage),
)
