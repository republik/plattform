import React from 'react'
import Frame from '../components/Frame'

export default function Custom404() {
  return (
    <Frame>
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
    </Frame>
  )
}
