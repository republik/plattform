'use client'

import App from '@/components/App'
import { Body, Content, Header } from '@/components/Layout'
import { useMe } from '@/lib/useMe'

export default function NotFound() {
  const { me } = useMe()

  if (!me) {
    return <h1>404 - Page Not Found</h1>
  }

  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h1>404 - Page Not Found</h1>
          </div>
        </Content>
      </Body>
    </App>
  )
}
