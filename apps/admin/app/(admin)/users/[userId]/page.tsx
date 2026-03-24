'use client'

import { useParams, useSearchParams } from 'next/navigation'

import App from '@/components/App'

import { css } from '@republik/theme/css'

import AdminNotes from '@/components/Users/AdminNotes'
import AuthSettings from '@/components/Users/AuthSettings'
import Email from '@/components/Users/Email'
import Memberships from '@/components/Users/Memberships'
import NewsletterSubscriptions from '@/components/Users/NewsletterSubscriptions'
import User from '@/components/Users/Particulars'
import Pledges from '@/components/Users/Pledges'
import ProfileHeader from '@/components/Users/ProfileHeader'
import Roles from '@/components/Users/Roles'

import { Body, Content } from '@/components/Layout'
import Header from '@/components/Layout/Header'
import Access from '@/components/Users/Access'
import Actions from '@/components/Users/Actions'
import Dialog from '@/components/Users/Dialog'
import Links from '@/components/Users/Links'
import Mailbox from '@/components/Users/Mailbox'
import Sessions from '@/components/Users/Sessions'

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: '[repeat(auto-fit, minmax(300px, 1fr))]',
  }),
  span1: css({
    gridColumn: '[span 1]',
  }),
  span2: css({
    gridColumn: '[span 2]',
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
      // @ts-expect-error not typed
      <Sessions userId={userId} />
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
        {/* @ts-expect-error not typed */}
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

const UserPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.userId as string
  const section = searchParams.get('section') || 'index'

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

export default UserPage
