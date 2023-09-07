import React from 'react'
import Frame from '../components/Frame'
import { useMe } from '../lib/useMe'

export default function Custom404() {
  const { me } = useMe()

  if (!me) {
    return <h1>404 - Page not found</h1>
  }

  return (
    <Frame>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav></Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body>
        <h1>404 - Page not found</h1>
      </Frame.Body>
    </Frame>
  )
}
