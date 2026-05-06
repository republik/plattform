'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import App from '@/components/App'

import { Body, Content, Header } from '@/components/Layout'
import MailboxPage from '@/components/Mailbox/Page'

const Mailbox = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const changeHandler = (params) => {
    const qs = new URLSearchParams(params ?? {}).toString()
    router.replace('/mailbox' + (qs ? '?' + qs : ''))
  }

  return (
    <App>
      <Body>
        <Header search={searchParams.get('search')} />
        <Content id='content'>
          <MailboxPage
            params={Object.fromEntries(searchParams.entries())}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
}

export default Mailbox
