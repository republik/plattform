'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import App from '@/components/App'
import { Body, Content, Header } from '@/components/Layout'
import Users from '@/components/Users/List'

const UserOverview = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const changeHandler = (params) => {
    const qs = new URLSearchParams(params ?? {}).toString()
    router.replace('/users' + (qs ? '?' + qs : ''))
  }

  return (
    <App>
      <Body>
        <Header search={searchParams.get('search')} />
        <Content id='content'>
          <Users
            // @ts-expect-error not typed
            params={Object.fromEntries(searchParams.entries())}
            onChange={changeHandler}
          />
        </Content>
      </Body>
    </App>
  )
}

export default UserOverview
